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
    <div className="w-80 bg-white border-l border-slate-200 flex flex-col h-full shrink-0 select-none">
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
        {/* BLOCK WIDTH CONTROL (SLIDER & PRESETS) */}
        {props.width !== undefined && (
          <div className="space-y-2 bg-blue-50/60 p-3 rounded-2xl border border-blue-200">
            <div className="flex justify-between font-black text-slate-900 text-xs">
              <span>↔️ Largeur du Bloc (Width)</span>
              <span className="text-[#00A0FF] font-mono">{props.width}%</span>
            </div>
            <input
              type="range"
              min={20}
              max={100}
              step={5}
              value={props.width}
              onChange={(e) =>
                actions.setProp(id, (nodeProps: any) => {
                  nodeProps.width = parseInt(e.target.value, 10);
                })
              }
              className="w-full accent-[#00A0FF]"
            />
            <div className="grid grid-cols-5 gap-1 pt-0.5">
              {[100, 75, 50, 33, 25].map((w) => (
                <button
                  key={w}
                  onClick={() =>
                    actions.setProp(id, (nodeProps: any) => {
                      nodeProps.width = w;
                    })
                  }
                  className={`py-1 rounded font-black text-[10px] transition-colors ${
                    props.width === w
                      ? 'bg-[#00A0FF] text-white'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {w}%
                </button>
              ))}
            </div>
          </div>
        )}

        {/* UNIFIED HEIGHT CONTROL FOR ALL COMPONENTS */}
        {props.height !== undefined && (
          <div className="space-y-2 bg-indigo-50/60 p-3 rounded-2xl border border-indigo-200">
            <div className="flex justify-between font-black text-slate-900 text-xs">
              <span>↕️ Hauteur du Bloc (Height)</span>
              <span className="text-[#00A0FF] font-mono">{props.height}px</span>
            </div>
            <input
              type="range"
              min={30}
              max={650}
              step={10}
              value={props.height}
              onChange={(e) =>
                actions.setProp(id, (nodeProps: any) => {
                  nodeProps.height = parseInt(e.target.value, 10);
                })
              }
              className="w-full accent-[#00A0FF]"
            />
            <div className="grid grid-cols-4 gap-1 pt-0.5">
              {[50, 150, 300, 500].map((h) => (
                <button
                  key={h}
                  onClick={() =>
                    actions.setProp(id, (nodeProps: any) => {
                      nodeProps.height = h;
                    })
                  }
                  className={`py-1 rounded font-black text-[10px] transition-colors ${
                    props.height === h
                      ? 'bg-[#00A0FF] text-white'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {h}px
                </button>
              ))}
            </div>
          </div>
        )}

        {/* EMOJI PICKER & CUSTOM EMOJI INPUT */}
        {(props.emoji !== undefined || name === 'Carte d Information' || name === 'Texte / Titre' || name === 'Bouton d Action') && (
          <div className="space-y-2.5 bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200">
            <div className="flex items-center justify-between font-black text-slate-900 text-xs">
              <span>😀 Icône Émoji du Titre / Bloc</span>
              <span className="text-amber-600 font-mono text-base font-bold">{props.emoji || 'Aucun'}</span>
            </div>

            {/* EMOJI QUICK PRESETS GRID */}
            <div className="grid grid-cols-6 gap-1 bg-white p-2 rounded-xl border border-amber-200 shadow-xs">
              {[
                '💡', '🚀', '🔥', '⚡', '⭐', '🎁',
                '🎯', '✅', '🔒', '👉', '🏆', '💎',
                '❤️', '💼', '💰', '📌', '✨', '🎉',
                '🔑', '📢', '📈', '🎓', '🥇', '👑',
              ].map((emo) => (
                <button
                  key={emo}
                  onClick={() =>
                    actions.setProp(id, (nodeProps: any) => {
                      nodeProps.emoji = emo;
                    })
                  }
                  className={`p-1 rounded-lg text-lg text-center transition-transform hover:scale-125 ${
                    props.emoji === emo ? 'bg-amber-200 ring-2 ring-amber-400' : 'hover:bg-slate-100'
                  }`}
                >
                  {emo}
                </button>
              ))}
            </div>

            {/* CUSTOM EMOJI INPUT & POSITION */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Coller n importe quel émoji..."
                  value={props.emoji || ''}
                  onChange={(e) =>
                    actions.setProp(id, (nodeProps: any) => {
                      nodeProps.emoji = e.target.value;
                    })
                  }
                  className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs"
                />
                {props.emoji && (
                  <button
                    onClick={() =>
                      actions.setProp(id, (nodeProps: any) => {
                        nodeProps.emoji = '';
                      })
                    }
                    className="px-3 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold hover:bg-rose-100"
                  >
                    Effacer
                  </button>
                )}
              </div>

              {props.emoji && (
                <div className="flex items-center justify-between pt-1">
                  <label className="font-bold text-slate-700 text-[11px]">Position d émoji</label>
                  <div className="grid grid-cols-2 gap-1 w-36">
                    {['left', 'right'].map((pos) => (
                      <button
                        key={pos}
                        onClick={() =>
                          actions.setProp(id, (nodeProps: any) => {
                            nodeProps.emojiPosition = pos;
                          })
                        }
                        className={`py-1 rounded-lg border font-extrabold text-[10px] capitalize transition-colors ${
                          (props.emojiPosition || 'left') === pos
                            ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-100/50'
                        }`}
                      >
                        {pos === 'left' ? 'Gauche' : 'Droite'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* GOOGLE FONTS SELECTOR */}
        {props.fontFamily !== undefined && (
          <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <label className="font-black text-slate-900 flex items-center justify-between text-xs">
              <span>🔤 Police Google Font</span>
              <span className="text-[#00A0FF] font-mono text-[10px]">{props.fontFamily || 'Inter'}</span>
            </label>
            <select
              value={props.fontFamily || 'Inter'}
              onChange={(e) =>
                actions.setProp(id, (nodeProps: any) => {
                  nodeProps.fontFamily = e.target.value;
                })
              }
              className="w-full p-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-extrabold text-xs outline-none focus:ring-2 focus:ring-[#00A0FF]"
            >
              <option value="Inter">Inter (Sans-serif Moderne)</option>
              <option value="Poppins">Poppins (Design Dynamique)</option>
              <option value="Montserrat">Montserrat (Élégant & Structuré)</option>
              <option value="Playfair Display">Playfair Display (Serif Luxueux)</option>
              <option value="Roboto">Roboto (Clair & Standard)</option>
              <option value="Oswald">Oswald (Titres Condensés)</option>
              <option value="Lora">Lora (Serif Éditorial)</option>
              <option value="Raleway">Raleway (Minimaliste Chic)</option>
              <option value="Cinzel">Cinzel (Haut de Gamme)</option>
              <option value="Caveat">Caveat (Écriture Script / Manuscrite)</option>
              <option value="Plus Jakarta Sans">Plus Jakarta Sans (Tech Bold)</option>
            </select>
          </div>
        )}

        {/* BACKGROUND COLOR & BACKGROUND IMAGE CONTROL FOR ALL COMPONENTS */}
        <div className="space-y-3 bg-purple-50/60 p-3.5 rounded-2xl border border-purple-200">
          <label className="font-black text-slate-900 flex items-center gap-1.5 text-xs">
            <span>🖼️ Arrière-plan du Bloc</span>
          </label>

          {/* BG COLOR PICKER */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 text-[11px]">Couleur de Fond</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={props.bgColor || '#ffffff'}
                onChange={(e) =>
                  actions.setProp(id, (nodeProps: any) => {
                    nodeProps.bgColor = e.target.value;
                  })
                }
                className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={props.bgColor || '#ffffff'}
                onChange={(e) =>
                  actions.setProp(id, (nodeProps: any) => {
                    nodeProps.bgColor = e.target.value;
                  })
                }
                className="flex-1 p-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-xs"
              />
            </div>
          </div>

          {/* BG IMAGE FILE PICKER / URL */}
          <div className="space-y-1.5 pt-1.5 border-t border-purple-200/80">
            <div className="flex justify-between items-center font-bold text-slate-700 text-[11px]">
              <span>Photo d Arrière-plan (PC / URL)</span>
              {props.bgImage && (
                <button
                  onClick={() =>
                    actions.setProp(id, (nodeProps: any) => {
                      nodeProps.bgImage = '';
                    })
                  }
                  className="text-rose-600 hover:underline text-[10px] font-bold"
                >
                  Supprimer
                </button>
              )}
            </div>

            <label className="block cursor-pointer">
              <div className="p-2 bg-white border border-dashed border-purple-300 rounded-xl flex items-center justify-center text-purple-700 font-bold text-xs gap-1.5 hover:bg-purple-100/50 transition-colors shadow-xs">
                <span>📁 Choisir une photo de fond (PC)</span>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      actions.setProp(id, (nodeProps: any) => {
                        nodeProps.bgImage = ev.target?.result as string;
                      });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>

            <input
              type="text"
              placeholder="Ou coller une URL d image..."
              value={props.bgImage || ''}
              onChange={(e) =>
                actions.setProp(id, (nodeProps: any) => {
                  nodeProps.bgImage = e.target.value;
                })
              }
              className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs"
            />
          </div>
        </div>

        {/* BORDER RADIUS (ARRONDI DES COINS) */}
        {props.borderRadius !== undefined && (
          <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="flex justify-between font-black text-slate-900 text-xs">
              <span>🔘 Arrondi des Coins</span>
              <span className="text-[#00A0FF] font-mono">{props.borderRadius}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={48}
              step={2}
              value={props.borderRadius}
              onChange={(e) =>
                actions.setProp(id, (nodeProps: any) => {
                  nodeProps.borderRadius = parseInt(e.target.value, 10);
                })
              }
              className="w-full accent-[#00A0FF]"
            />
            <div className="grid grid-cols-5 gap-1 pt-0.5">
              {[
                { label: '0px', val: 0 },
                { label: '8px', val: 8 },
                { label: '16px', val: 16 },
                { label: '24px', val: 24 },
                { label: 'Rond', val: 999 },
              ].map((b) => (
                <button
                  key={b.val}
                  onClick={() =>
                    actions.setProp(id, (nodeProps: any) => {
                      nodeProps.borderRadius = b.val;
                    })
                  }
                  className={`py-1 rounded font-black text-[10px] transition-colors ${
                    props.borderRadius === b.val
                      ? 'bg-[#00A0FF] text-white'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* BOX SHADOW (OMBRE PORTÉE SUR MESURE) */}
        <div className="space-y-3 bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200">
          <div className="flex items-center justify-between font-black text-slate-900 text-xs">
            <span>✨ Ombre Portée</span>
            <span className="text-amber-600 font-mono text-[10px] uppercase font-bold">
              {props.shadowPreset || 'none'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {[
              { key: 'none', label: 'Aucune' },
              { key: 'sm', label: 'Subtile ☁️' },
              { key: 'md', label: 'Moyenne 🌤️' },
              { key: 'lg', label: 'Marquée ☀️' },
              { key: 'xl', label: 'Intense 💥' },
              { key: 'custom', label: 'Sur Mesure 🎨' },
            ].map((preset) => (
              <button
                key={preset.key}
                onClick={() =>
                  actions.setProp(id, (nodeProps: any) => {
                    nodeProps.shadowPreset = preset.key;
                  })
                }
                className={`py-1.5 px-2 rounded-lg border font-extrabold text-[10px] transition-colors ${
                  props.shadowPreset === preset.key
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-100/50'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* CUSTOM ADVANCED SHADOW CONTROLS */}
          {(props.shadowPreset === 'custom' || (props.shadowPreset !== undefined && props.shadowPreset !== 'none')) && (
            <div className="space-y-3 pt-2 border-t border-amber-200/80">
              {/* SHADOW COLOUR & OPACITY */}
              <div className="grid grid-cols-2 gap-2 items-center">
                <div>
                  <label className="font-bold text-slate-700 text-[11px]">Couleur d Ombre</label>
                  <div className="flex items-center gap-1.5 mt-1">
                    <input
                      type="color"
                      value={props.shadowColor || '#000000'}
                      onChange={(e) =>
                        actions.setProp(id, (nodeProps: any) => {
                          nodeProps.shadowColor = e.target.value;
                          nodeProps.shadowPreset = 'custom';
                        })
                      }
                      className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={props.shadowColor || '#000000'}
                      onChange={(e) =>
                        actions.setProp(id, (nodeProps: any) => {
                          nodeProps.shadowColor = e.target.value;
                          nodeProps.shadowPreset = 'custom';
                        })
                      }
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-[10px]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-700 text-[11px]">
                    <span>Transparence</span>
                    <span>{props.shadowOpacity !== undefined ? props.shadowOpacity : 20}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={props.shadowOpacity !== undefined ? props.shadowOpacity : 20}
                    onChange={(e) =>
                      actions.setProp(id, (nodeProps: any) => {
                        nodeProps.shadowOpacity = parseInt(e.target.value, 10);
                        nodeProps.shadowPreset = 'custom';
                      })
                    }
                    className="w-full accent-amber-500 mt-2"
                  />
                </div>
              </div>

              {/* SHADOW BLUR (DIFFUS VS CONCENTRE) */}
              <div className="space-y-1">
                <div className="flex justify-between font-bold text-slate-700 text-[11px]">
                  <span>Flou (Concentré vs Diffus)</span>
                  <span>{props.shadowBlur !== undefined ? props.shadowBlur : 15}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={60}
                  step={2}
                  value={props.shadowBlur !== undefined ? props.shadowBlur : 15}
                  onChange={(e) =>
                    actions.setProp(id, (nodeProps: any) => {
                      nodeProps.shadowBlur = parseInt(e.target.value, 10);
                      nodeProps.shadowPreset = 'custom';
                    })
                  }
                  className="w-full accent-amber-500"
                />
                <div className="flex justify-between text-[9px] text-slate-400 font-semibold px-0.5">
                  <span>Net / Concentré (0px)</span>
                  <span>Très Diffus (60px)</span>
                </div>
              </div>

              {/* SHADOW OFFSET Y (TAILLE / DECALAGE) */}
              <div className="space-y-1">
                <div className="flex justify-between font-bold text-slate-700 text-[11px]">
                  <span>Taille / Décalage Vertical</span>
                  <span>{props.shadowOffsetY !== undefined ? props.shadowOffsetY : 10}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={40}
                  step={2}
                  value={props.shadowOffsetY !== undefined ? props.shadowOffsetY : 10}
                  onChange={(e) =>
                    actions.setProp(id, (nodeProps: any) => {
                      nodeProps.shadowOffsetY = parseInt(e.target.value, 10);
                      nodeProps.shadowPreset = 'custom';
                    })
                  }
                  className="w-full accent-amber-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* BUTTON HEIGHT CONTROL (PADDING Y) */}
        {props.paddingY !== undefined && (
          <div className="space-y-2 bg-indigo-50/60 p-3 rounded-2xl border border-indigo-200">
            <div className="flex justify-between font-black text-slate-900 text-xs">
              <span>↕️ Hauteur du Bouton (Padding Y)</span>
              <span className="text-[#00A0FF] font-mono">{props.paddingY}px</span>
            </div>
            <input
              type="range"
              min={6}
              max={36}
              step={2}
              value={props.paddingY}
              onChange={(e) =>
                actions.setProp(id, (nodeProps: any) => {
                  nodeProps.paddingY = parseInt(e.target.value, 10);
                })
              }
              className="w-full accent-[#00A0FF]"
            />
          </div>
        )}

        {/* CONTAINER / CARD PADDING (VERTICAL HEIGHT & SPACING) */}
        {props.padding !== undefined && (
          <div className="space-y-2 bg-indigo-50/60 p-3 rounded-2xl border border-indigo-200">
            <div className="flex justify-between font-black text-slate-900 text-xs">
              <span>↕️ Hauteur Interne (Padding)</span>
              <span className="text-[#00A0FF] font-mono">{props.padding}px</span>
            </div>
            <input
              type="range"
              min={4}
              max={120}
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
                      ? 'bg-[#00A0FF] text-white border-[#00A0FF] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {numCols} Cols
                </button>
              ))}
            </div>

            {props.columns === 2 && (
              <div className="space-y-1.5 pt-2 border-t border-emerald-200">
                <label className="font-bold text-slate-700">Proportions 2 Colonnes</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: '50 / 50', widths: [50, 50] },
                    { label: '66 / 33', widths: [66, 34] },
                    { label: '33 / 66', widths: [34, 66] },
                    { label: '75 / 25', widths: [75, 25] },
                    { label: '25 / 75', widths: [25, 75] },
                  ].map((preset, i) => (
                    <button
                      key={i}
                      onClick={() =>
                        actions.setProp(id, (nodeProps: any) => {
                          nodeProps.columnWidths = preset.widths;
                        })
                      }
                      className="py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg font-bold text-[10px] text-slate-800 transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

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

        {/* IMAGE SRC */}
        {props.src !== undefined && (
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
        )}
      </div>
    </div>
  );
};
