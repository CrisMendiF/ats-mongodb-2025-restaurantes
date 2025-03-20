// 2. Implementación de consultas en MongoDB

// Buscar todos los restaurantes de un tipo de comida específico (ej. "Chinese")
db.restaurants.find({ type_of_food: "Chinese" })

// Listar las inspecciones con violaciones, ordenadas por fecha
db.inspections.find({ "result": "Violation Issued" }).sort({ "inspection_date": -1 })

// Encontrar restaurantes con una calificación superior a 4
db.restaurants.find({ "rating": { $gt: 4 } })


// 3. Uso de agregaciones

// Agrupar restaurantes por tipo de comida y calcular la calificación promedio
db.restaurants.aggregate([ 
  { $group: { _id: "$type_of_food", promedio: { $avg: "$rating" } } } 
])


// Contar el número de inspecciones por resultado y mostrar los porcentajes
db.inspections_true.aggregate([
  { 
    $group: { 
      _id: "$result", 
      count: { $sum: 1 } 
    } 
  },
  { 
    $group: { 
      _id: null, 
      total: { $sum: "$count" }, 
      inspecciones: { $push: { result: "$_id", total_indiv: "$count" } }
    } 
  },
  { $unwind: "$inspecciones" },
  { 
    $project: { 
      _id: 0, 
      result: "$inspecciones.result", 
      porcentaje: { 
        $multiply: [{ $divide: ["$inspecciones.total_indiv", "$total"] }, 100] 
      }
    } 
  }
])


// Unir restaurantes con sus inspecciones utilizando $lookup
db.restaurants.aggregate([
  {
    $lookup: {
      from: "inspections_true",
      localField: "_id",
      foreignField: "restaurant_id",
      as: "inspection_history"
    }
  },
  { $unwind: "$inspection_history" },
  { 
    $project: {  
      _id: 1, 
      name: 1, 
      "inspection_history.date": 1 
    } 
  }
])
