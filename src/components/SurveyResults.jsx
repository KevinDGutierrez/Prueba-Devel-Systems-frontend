import React, { useState, useEffect } from 'react';
import ExcelJS from 'exceljs';
import { 
  ArrowLeft, 
  Table, 
  Layers, 
  MessageSquare, 
  Search, 
  PieChart as PieIcon,
  BarChart2,
  FileSpreadsheet
} from 'lucide-react';
import ApiService from '../services/api';

const PALETTE = ['#0f172a', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

function DonutChart({ items, total }) {
  if (total === 0 || items.length === 0) return null;

  let cumulativeAngle = 0;
  const radius = 38;
  const strokeWidth = 14;
  const center = 50;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 py-2">
      <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {items.map(([val, count], index) => {
            const strokeDasharray = `${(count / total) * circumference} ${circumference}`;
            const strokeDashoffset = -cumulativeAngle;
            cumulativeAngle += (count / total) * circumference;
            const color = PALETTE[index % PALETTE.length];

            return (
              <circle
                key={index}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500 ease-out"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-sm font-bold text-slate-900 leading-none">{total}</span>
          <span className="text-[9px] text-slate-400 mt-0.5">respuestas</span>
        </div>
      </div>

      <div className="space-y-1.5 flex-1 w-full min-w-0">
        {items.map(([val, count], idx) => {
          const color = PALETTE[idx % PALETTE.length];
          const pct = Math.round((count / total) * 100);

          return (
            <div key={idx} className="flex items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-slate-700 truncate text-[11px]" title={val}>{val}</span>
              </div>
              <span className="font-semibold text-slate-900 text-[11px] shrink-0 font-mono">
                {count} ({pct}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SurveyResults({ idEncuesta, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [modoVisualizacion, setModoVisualizacion] = useState('graficas');

  useEffect(() => {
    async function fetchResultados() {
      try {
        setLoading(true);
        const res = await ApiService.getResultados(idEncuesta);
        setData(res.data);
      } catch (err) {
        setError(err.message || 'Error al obtener resultados');
      } finally {
        setLoading(false);
      }
    }
    fetchResultados();
  }, [idEncuesta]);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-500 animate-fade-in">
        Cargando analíticas...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-rose-50 p-4 rounded-lg border border-rose-200 text-rose-700 text-xs">
        <p className="font-medium">Error al cargar:</p>
        <p>{error}</p>
        <button
          type="button"
          onClick={onBack}
          className="mt-3 px-3 py-1 bg-white text-slate-800 rounded border border-slate-200 text-xs cursor-pointer"
        >
          Volver
        </button>
      </div>
    );
  }

  const { encuesta, campos, respuestas } = data;

  const respuestasFiltradas = respuestas.filter(r => {
    if (!filtroTexto.trim()) return true;
    const term = filtroTexto.toLowerCase();
    return r.valores.some(v => v.valor && String(v.valor).toLowerCase().includes(term));
  });

  const exportarExcel = async () => {
    if (respuestas.length === 0) return;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'ACME Surveys Platform';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Resultados', {
      views: [{ showGridLines: true }]
    });

    const headers = ['ID Respuesta', 'Fecha', 'Hora', 'Dirección IP', ...campos.map(c => c.titulo_etiqueta)];
    const totalCols = headers.length;

    sheet.mergeCells(1, 1, 1, totalCols);
    const titleCell = sheet.getCell(1, 1);
    titleCell.value = `ACME SURVEYS • REPORTE: ${encuesta.titulo.toUpperCase()}`;
    titleCell.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0F172A' }
    };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getRow(1).height = 36;

    sheet.mergeCells(2, 1, 2, totalCols);
    const metaCell = sheet.getCell(2, 1);
    metaCell.value = `Generado: ${new Date().toLocaleString()}  |  Total de Respuestas: ${respuestas.length}  |  Estado: ${encuesta.estado.toUpperCase()}`;
    metaCell.font = { name: 'Segoe UI', size: 9, italic: true, color: { argb: 'FF475569' } };
    metaCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF1F5F9' }
    };
    metaCell.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getRow(2).height = 20;

    sheet.addRow([]);
    sheet.getRow(3).height = 8;

    const headerRow = sheet.addRow(headers);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E293B' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'medium', color: { argb: 'FF0F172A' } },
        bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
        left: { style: 'thin', color: { argb: 'FF334155' } },
        right: { style: 'thin', color: { argb: 'FF334155' } }
      };
    });

    respuestas.forEach((r, idx) => {
      const fechaObj = new Date(r.fecha_respuesta);
      const fecha = isNaN(fechaObj.getTime()) ? '' : fechaObj.toLocaleDateString();
      const hora = isNaN(fechaObj.getTime()) ? '' : fechaObj.toLocaleTimeString();
      const valoresMap = new Map(r.valores.map(v => [v.id_campo, v.valor]));
      const valoresCampos = campos.map(c => {
        const val = valoresMap.get(c.id_campo);
        return val !== undefined && val !== null ? val : '';
      });

      const rowValues = [r.id_respuesta, fecha, hora, r.direccion_ip || 'N/A', ...valoresCampos];
      const dataRow = sheet.addRow(rowValues);
      dataRow.height = 22;

      const isEven = idx % 2 === 0;
      const rowBgColor = isEven ? 'FFFFFFFF' : 'FFF8FAFC';

      dataRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.font = { name: 'Segoe UI', size: 9.5, color: { argb: 'FF1E293B' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: rowBgColor }
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
        };

        if (colNumber === 1 || colNumber === 2 || colNumber === 3) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        }
      });
    });

    sheet.columns.forEach((col, index) => {
      let maxLen = headers[index] ? String(headers[index]).length : 10;
      sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber > 3) {
          const val = row.getCell(index + 1).value;
          if (val) {
            const len = String(val).length;
            if (len > maxLen) maxLen = len;
          }
        }
      });
      col.width = Math.min(Math.max(maxLen + 4, 13), 50);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const cleanTitle = encuesta.titulo.replace(/[^a-zA-Z0-9]/g, '_');
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Resultados_${cleanTitle}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 pb-12 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-base font-semibold text-slate-900 leading-tight">
              {encuesta.titulo}
            </h2>
            <p className="text-xs text-slate-500">
              {encuesta.total_respuestas} respuestas recibidas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/60">
            <button
              type="button"
              onClick={() => setModoVisualizacion('graficas')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                modoVisualizacion === 'graficas' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <PieIcon size={12} />
              <span>Gráficas</span>
            </button>
            <button
              type="button"
              onClick={() => setModoVisualizacion('matriz')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                modoVisualizacion === 'matriz' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Table size={12} />
              <span>Matriz</span>
            </button>
          </div>

          <button
            type="button"
            onClick={exportarExcel}
            disabled={respuestas.length === 0}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
          >
            <FileSpreadsheet size={13} />
            <span>Exportar Excel</span>
          </button>
        </div>
      </div>

      {modoVisualizacion === 'graficas' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campos.map((campo) => {
            const valoresDelCampo = respuestas.map(r => {
              const v = r.valores.find(item => item.id_campo === campo.id_campo);
              return v ? v.valor : null;
            }).filter(v => v !== null && v !== undefined && v !== '');

            const conteoFrecuencia = {};
            valoresDelCampo.forEach(val => {
              const key = String(val);
              conteoFrecuencia[key] = (conteoFrecuencia[key] || 0) + 1;
            });

            const itemsFrecuencia = Object.entries(conteoFrecuencia).sort((a, b) => b[1] - a[1]).slice(0, 6);
            const totalRespondieron = valoresDelCampo.length;

            return (
              <div key={campo.id_campo} className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="min-w-0 pr-2">
                    <h4 className="text-xs font-semibold text-slate-900 truncate">
                      {campo.titulo_etiqueta}
                    </h4>
                    <span className="text-[10px] text-slate-400 uppercase">
                      Campo: {campo.tipo_campo} • {totalRespondieron} respuestas
                    </span>
                  </div>
                </div>

                {itemsFrecuencia.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Aún no se han agregado datos de respuestas en este campo.
                  </div>
                ) : (
                  <DonutChart items={itemsFrecuencia} total={totalRespondieron} />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-md rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-3 border-b border-slate-100 flex items-center justify-between gap-4">
            <span className="text-xs font-semibold text-slate-800">
              Respuestas individuales ({respuestasFiltradas.length})
            </span>

            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
                placeholder="Buscar..."
                className="pl-7 pr-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-none focus:border-slate-800 w-48"
              />
            </div>
          </div>

          {respuestasFiltradas.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Aún no se han agregado datos de respuestas.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Fecha</th>
                    {campos.map((c) => (
                      <th key={c.id_campo} className="py-2.5 px-3 min-w-[140px]">
                        <div>{c.titulo_etiqueta}</div>
                        <span className="text-[10px] text-slate-400 font-normal uppercase">{c.tipo_campo}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {respuestasFiltradas.map((r, idx) => {
                    const valoresMap = new Map(r.valores.map(v => [v.id_campo, v.valor]));

                    return (
                      <tr key={r.id_respuesta} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                          {new Date(r.fecha_respuesta).toLocaleDateString()}
                        </td>
                        {campos.map((c) => {
                          const val = valoresMap.get(c.id_campo);
                          return (
                            <td key={c.id_campo} className="py-2.5 px-3 text-slate-800">
                              {val !== undefined && val !== null && val !== '' ? (
                                <span>{String(val)}</span>
                              ) : (
                                <span className="text-slate-300 italic">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
