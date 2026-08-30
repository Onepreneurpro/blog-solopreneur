'use client';

import React from 'react';
import { useEditor } from '@craftjs/core';
import { Settings, Trash2 } from 'lucide-react';

export const SettingsPanel = () => {
  const { selected, actions } = useEditor((state, query) => {
    const [currentNodeId] = state.events.selected;
    let selectedNode;

    if (currentNodeId) {
      selectedNode = {
        id: currentNodeId,
        name: state.nodes[currentNodeId].data.name || state.nodes[currentNodeId].data.displayName,
        settings: state.nodes[currentNodeId].related && state.nodes[currentNodeId].related.settings,
        isDeletable: query.node(currentNodeId).isDeletable(),
        props: state.nodes[currentNodeId].data.props,
      };
    }

    return {
      selected: selectedNode,
    };
  });

  if (!selected) {
    return (
      <div className="w-80 bg-white border-l border-slate-200 p-6 flex flex-col items-center justify-center text-center text-slate-400 shrink-0">
        <Settings className="w-10 h-10 text-slate-300 mb-3 animate-pulse" />
        <h3 className="text-xs font-black uppercase font-heading text-slate-600">Aucun élément sélectionné</h3>
        <p className="text-[11px] text-slate-400 font-medium mt-1">
          Cliquez sur un élément de la page pour modifier ses réglages avancés.
        </p>
      </div>
    );
  }

  const { id, name, isDeletable, props } = selected;

  return (
    <div className="w-80 bg-white border-l border-slate-200 flex flex-col h-full shrink-0">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div>
          <span className="text-[9px] font-mono font-bold text-[#00A0FF] uppercase bg-[#00A0FF]/10 border border-[#00A0FF]/30 px-2 py-0.5 rounded-full">
            INSPECTEUR CRAFT.JS
          </span>
          <h2 className="text-xs font-black font-heading text-slate-900 mt-1">{name}</h2>
        </div>

        {isDeletable && (
          <button
            onClick={() => actions.delete(id)}
            title="Supprimer cet élément"
            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
        {/* GRID COLUMNS SELECTOR (2, 3, 4 COLUMNS) */}
        {props.columns !== undefined && (
          <div className="space-y-3 bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200">
            <label className="font-black text-slate-900 flex items-center gap-1.5 text-xs">
              <span>📐 Modèle de Grille (Colonnes)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[2, 3, 4].map((numCols) => (
                <button
                  key={numCols}
                  onClick={() =>
                    actions.setProp(id, (nodeProps: any) => {
                      nodeProps.columns = numCols;
                    })
                  }
                  className={`py-2 px-2 rounded-xl border font-black text-xs transition-all ${
                    props.columns === numCols
                      ? 'bg-[#00A0FF] text-white border-[#00A0FF] shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {numCols} Cols
                </button>
              ))}
            </div>

            {props.gap !== undefined && (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Espacement entre colonnes (Gap)</span>
                  <span>{props.gap}px</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={48}
                  step={4}
                  value={props.gap}
                  onChange={(e) =>
                    actions.setProp(id, (nodeProps: any) => {
                      nodeProps.gap = parseInt(e.target.value, 10);
                    })
                  }
                  className="w-full accent-[#00A0FF]"
                />
              </div>
            )}
          </div>
        )}

        {/* TEXT PROPS */}
        {props.text !== undefined && (
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Texte / Contenu</label>
            <textarea
              value={props.text}
              onChange={(e) =>
                actions.setProp(id, (nodeProps: any) => {
                  nodeProps.text = e.target.value;
                })
              }
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-[#00A0FF] resize-none"
              rows={3}
            />
          </div>
        )}

        {/* FONT SIZE */}
        {props.fontSize !== undefined && (
          <div className="space-y-1.5">
            <div className="flex justify-between font-bold text-slate-700">
              <span>Taille de police</span>
              <span>{props.fontSize}px</span>
            </div>
            <input
              type="range"
              min={12}
              max={64}
              value={props.fontSize}
              onChange={(e) =>
                actions.setProp(id, (nodeProps: any) => {
                  nodeProps.fontSize = parseInt(e.target.value, 10);
                })
              }
              className="w-full accent-[#00A0FF]"
            />
          </div>
        )}

        {/* ALIGNMENT */}
        {props.textAlign !== undefined && (
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Alignement du Texte</label>
            <div className="grid grid-cols-3 gap-2">
              {['left', 'center', 'right'].map((align) => (
                <button
                  key={align}
                  onClick={() =>
                    actions.setProp(id, (nodeProps: any) => {
                      nodeProps.textAlign = align;
                    })
                  }
                  className={`py-1.5 rounded-lg border font-bold capitalize transition-colors ${
                    props.textAlign === align
                      ? 'bg-[#00A0FF] text-white border-[#00A0FF]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {align === 'left' ? 'Gauche' : align === 'center' ? 'Centre' : 'Droite'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* BUTTON BG COLOR */}
        {props.bgColor !== undefined && (
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Couleur de fond</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={props.bgColor || '#00A0FF'}
                onChange={(e) =>
                  actions.setProp(id, (nodeProps: any) => {
                    nodeProps.bgColor = e.target.value;
                  })
                }
                className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={props.bgColor || '#00A0FF'}
                onChange={(e) =>
                  actions.setProp(id, (nodeProps: any) => {
                    nodeProps.bgColor = e.target.value;
                  })
                }
                className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs"
              />
            </div>
          </div>
        )}

        {/* IMAGE SRC & HEIGHT */}
        {props.src !== undefined && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">URL ou Fichier Image</label>
              <input
                type="text"
                value={props.src}
                onChange={(e) =>
                  actions.setProp(id, (nodeProps: any) => {
                    nodeProps.src = e.target.value;
                  })
                }
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs"
              />
            </div>

            {props.height !== undefined && (
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Hauteur d Image</span>
                  <span>{props.height}px</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={600}
                  step={10}
                  value={props.height}
                  onChange={(e) =>
                    actions.setProp(id, (nodeProps: any) => {
                      nodeProps.height = parseInt(e.target.value, 10);
                    })
                  }
                  className="w-full accent-[#00A0FF]"
                />
              </div>
            )}
          </div>
        )}

        {/* CONTAINER PADDING */}
        {props.padding !== undefined && (
          <div className="space-y-1.5">
            <div className="flex justify-between font-bold text-slate-700">
              <span>Remplissage Interne (Padding)</span>
              <span>{props.padding}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={4}
              value={props.padding}
              onChange={(e) =>
                actions.setProp(id, (nodeProps: any) => {
                  nodeProps.padding = parseInt(e.target.value, 10);
                })
              }
              className="w-full accent-[#00A0FF]"
            />
          </div>
        )}
      </div>
    </div>
  );
};
