import MovimientoReactivo from "../models/movimientos/MovimientoReactivo.js";
import TipoMovimiento from "../models/movimientos/TipoMovimiento.js";
import Reactivo from "../models/reactivos/Reactivo.js";
import { supabase } from "../config/supabase.js";
import PDFDocument from "pdfkit-table"
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { table } from "console";
import UnidadMedida from "../models/reactivos/UnidadMedida.js"
import Gabinete from "../models/reactivos/Gabinete.js"
import Marca from "../models/reactivos/Marca.js"
import EstadoFisico from "../models/reactivos/EstadoFisico.js"


const bucketName = "pdfs";

async function datosPruebaMovimientos() {
    const movimientos = await MovimientoReactivo
    .find()
    .populate("idReactivo")
    .populate("idTipoMovimiento");

    let totalEntradas = 0;
    let totalSalidas = 0;

    movimientos.forEach(mov => {
    const tipo = mov.idTipoMovimiento.nombre;
    if (tipo === 'Entrada') {
        totalEntradas += mov.cantidad;
    } else if (tipo === 'Salida') {
        totalSalidas += mov.cantidad;
    }
    });

    return {
        totalEntradas: totalEntradas,
        totalSalidas: totalSalidas
    };
    
}

async function crearGrafico() {
    const width = 1000;
    const height = 600;
    const chartCanvas  = new ChartJSNodeCanvas({ width, height });

        const movimientos = await MovimientoReactivo
            .find()
            .populate("idReactivo")
            .populate("idTipoMovimiento");

        let totalEntradas = 0;
        let totalSalidas = 0;

        movimientos.forEach(mov => {
            const tipo = mov.idTipoMovimiento.nombre;
            if (tipo === 'Entrada') {
                totalEntradas += mov.cantidad;
            } else if (tipo === 'Salida') {
                totalSalidas += mov.cantidad;
            }
        });

        const config = {
            type: 'pie',
            data: {
              labels: [
                `Entradas (${totalEntradas})`,
                `Salidas (${totalSalidas})`
              ],
              datasets: [{
                label: 'Movimientos d Reactivos',
                data: [totalEntradas, totalSalidas],
                backgroundColor: ['#4CAF50', '#F44336'],
              }]
            },
            options: {
              plugins: {
                title: {
                  display: true,
                  text: 'Porcentaje de Movimientos de Reactivos',
                  font: {
                    size: 18
                  }
                },
                legend: {
                  position: 'bottom',
                  labels: {
                    font: {
                      size: 14
                    }
                  }
                },
                tooltip: {
                  callbacks: {
                    label: function (context) {
                      const label = context.label || '';
                      const value = context.raw || 0;
                      return `${label}: ${value}`;
                    }
                  }
                }
              }
            }
        };

        return await chartCanvas.renderToBuffer(config);
}

async function crearTabla(opcion) {
  switch (opcion) {
    case 1: {
      const reactivos = await Reactivo.find({status: true})
            .populate("idUnidadMedida")
            .populate("estadoFisico")
            .populate("idMarca")
            .populate("idGabinete");

      let datos = [];
      
      reactivos.forEach(rea => {
          datos.push([
              rea.nombre,
              rea.idGabinete.nombre,
              rea.idMarca.nombre,
              rea.idUnidadMedida.nombre,
              rea.estadoFisico.nombre,
              rea.esPeligroso,
              rea.cantidad
          ]);
      })

      const table = {
          title: 'Lista completa de Reactivos',
          headers: [
              "Nombre",
              "Gabinete",
              "Marca",
              "Unidad",
              "Estado Fisico",
              "¿Es peligroso?",
              "Cantidad"
          ],
          rows: datos
      };

      return table;
    }
    case 2: {
      
      const hace30Dias = new Date();
      hace30Dias.setDate(hace30Dias.getDate() - 30);

      const movimientos = await MovimientoReactivo.find(
        { fecha: { $gte: hace30Dias } }
      )
            .populate("idReactivo")
            .populate("idTipoMovimiento")


      console.log(movimientos);
      let datos = [];
      
      movimientos.forEach(mov => {
          datos.push([
              mov.idTipoMovimiento.nombre,
              mov.idReactivo.nombre,
              mov.descripcion,
              mov.cantidad,
              mov.fecha
          ]);
      })

      const table = {
          title: 'Lista de Movimientos de los Ultimos 30 dias',
          headers: [
              "Tipo movimiento",
              "Reactivo",
              "Descripcion",
              "Cantidad",
              "Fecha"
          ],
          rows: datos
      };

      return table;
    }
  }
    
}

async function insertarTablaConChequeo(doc, data) {
  const espacioMinimo = 100; 

  if (doc.y + espacioMinimo >= doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }

  await doc.table(data);
}

async function pruebaCrearPDF() {
  
    const doc = new PDFDocument({
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    const table = await crearTabla(1);
    let tablas = [];
    tablas.push(table);
    tablas.push(table);
    tablas.push(table);
    tablas.push(table);
    tablas.push(table);
    tablas.push(table);

    // await doc.table(table, { width: 500});

    (async () => {
      for (const data of tablas) {
        await insertarTablaConChequeo(doc, data);
        doc.moveDown(); // espacio entre tablas
      }
    })();

    const chartBuffer = await crearGrafico();
    doc.image(chartBuffer, {
        fit: [500, 300],
        align: 'center',
        valign: 'center'
    });
    
    doc.end();

    const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(`docs/${"adios9"}.pdf`, doc, {
      contentType: 'application/pdf',
      upsert: false,
      duplex: "half"
    });

    if (error) {
        console.error('❌ Error al subir:', error);
        return `❌ Error al subir: ${error}`
    } else {
        console.log('✅ PDF subido:', data);
        return `✅ PDF subido: ${data}`;
    }
}

async function pruebaCrearPDFDescarga(res) {
  
  const doc = new PDFDocument({
    margins: { top: 50, bottom: 50, left: 50, right: 50 }
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="reporte.pdf"');

  doc.pipe(res);

  const table = await crearTabla(2);
  let tablas = [];
  tablas.push(table);
  tablas.push(table);
  tablas.push(table);
  tablas.push(table);
  tablas.push(table);
  tablas.push(table);

  // await doc.table(table, { width: 500});

  (async () => {
    for (const data of tablas) {
      await insertarTablaConChequeo(doc, data);
      doc.moveDown(); // espacio entre tablas
    }
  })();

  const chartBuffer = await crearGrafico();
  doc.image(chartBuffer, {
      fit: [500, 300],
      align: 'center',
      valign: 'center'
  });

  doc.end();
}

const prueba = async (req, res) => {
    try {
        // const datos = await pruebaCrearPDF();
        // res.status(200).json(datos);
        await pruebaCrearPDFDescarga(res);
    } catch (error) {
        console.error("Error al obtener los datos de inicio:", error);
        res.status(500).json({ error: 'Error al obtener los datos de la prueba' });
    }
}

export { prueba };