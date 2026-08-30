import React from 'react';
import type { Config } from '@measured/puck';

export type PuckProps = {
  Hero: {
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
    bgGradient: string;
    imageUrl?: string;
  };
  Heading: {
    title: string;
    size: 'small' | 'medium' | 'large' | 'xl';
    align: 'left' | 'center' | 'right';
    color: string;
  };
  Text: {
    content: string;
    align: 'left' | 'center' | 'right';
    size: 'small' | 'medium' | 'large';
  };
  Button: {
    text: string;
    href: string;
    variant: 'primary' | 'secondary' | 'outline';
    align: 'left' | 'center' | 'right';
  };
  Feature4ColImg: {
    item1Title: string;
    item1Desc: string;
    item1Img: string;
    item2Title: string;
    item2Desc: string;
    item2Img: string;
    item3Title: string;
    item3Desc: string;
    item3Img: string;
    item4Title: string;
    item4Desc: string;
    item4Img: string;
    imgHeight: number;
    borderRadius: number;
  };
  Feature3ColImg: {
    item1Title: string;
    item1Desc: string;
    item1Img: string;
    item2Title: string;
    item2Desc: string;
    item2Img: string;
    item3Title: string;
    item3Desc: string;
    item3Img: string;
    imgHeight: number;
    borderRadius: number;
  };
  Card: {
    title: string;
    content: string;
    bgColor: string;
    borderColor: string;
  };
  LeadForm: {
    title: string;
    subtitle: string;
    buttonText: string;
    redirectUrl: string;
  };
  VideoEmbed: {
    videoUrl: string;
    caption: string;
  };
};

export const puckConfig: Config<PuckProps> = {
  categories: {
    layout: {
      title: '📐 Layout & Conteneurs',
      components: ['Hero', 'Card'],
    },
    features: {
      title: '🖼️ Blocs d Images & Colonnes',
      components: ['Feature4ColImg', 'Feature3ColImg'],
    },
    typography: {
      title: '✍️ Textes & Boutons',
      components: ['Heading', 'Text', 'Button'],
    },
    conversion: {
      title: '⚡ Capture & Vidéo',
      components: ['LeadForm', 'VideoEmbed'],
    },
  },

  components: {
    Hero: {
      fields: {
        title: { type: 'text', label: 'Titre principal' },
        subtitle: { type: 'textarea', label: 'Sous-titre' },
        buttonText: { type: 'text', label: 'Texte du bouton' },
        buttonLink: { type: 'text', label: 'Lien du bouton' },
        bgGradient: {
          type: 'select',
          label: 'Fond de la section',
          options: [
            { label: 'Bleu Ocean (#00A0FF)', value: 'from-blue-600 to-indigo-900' },
            { label: 'Sombre Ébène', value: 'from-slate-900 via-slate-950 to-black' },
            { label: 'Violet Royal', value: 'from-purple-900 to-[#00A0FF]' },
            { label: 'Émeraude Succès', value: 'from-emerald-800 to-teal-950' },
          ],
        },
        imageUrl: { type: 'text', label: "URL de l'image illustrative" },
      },
      defaultProps: {
        title: 'Transformez vos visiteurs en clients fidèles',
        subtitle: 'Une plateforme tout-en-un puissante et intuitive conçue pour maximiser vos conversions.',
        buttonText: 'Commencer maintenant 🚀',
        buttonLink: '#',
        bgGradient: 'from-blue-600 to-indigo-900',
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      },
      render: ({ title, subtitle, buttonText, buttonLink, bgGradient, imageUrl }) => (
        <div className={`w-full py-16 px-6 sm:px-12 bg-gradient-to-r ${bgGradient} text-white rounded-3xl shadow-2xl my-4`}>
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-6 flex-1 text-center md:text-left">
              <h1 className="text-3xl sm:text-5xl font-black font-heading leading-tight tracking-tight">
                {title}
              </h1>
              <p className="text-base sm:text-lg text-white/90 leading-relaxed font-medium">
                {subtitle}
              </p>
              <div className="pt-2">
                <a
                  href={buttonLink}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#00A0FF] hover:bg-[#0080FF] text-white font-black text-sm rounded-2xl shadow-xl hover:scale-105 transition-all"
                >
                  {buttonText}
                </a>
              </div>
            </div>
            {imageUrl && (
              <div className="w-full md:w-1/2 flex justify-center">
                <img
                  src={imageUrl}
                  alt="Hero illustration"
                  className="rounded-2xl border-4 border-white/20 shadow-2xl max-h-[340px] object-cover"
                />
              </div>
            )}
          </div>
        </div>
      ),
    },

    Heading: {
      fields: {
        title: { type: 'text', label: 'Titre' },
        size: {
          type: 'select',
          label: 'Taille',
          options: [
            { label: 'Petit (2xl)', value: 'small' },
            { label: 'Moyen (3xl)', value: 'medium' },
            { label: 'Grand (4xl)', value: 'large' },
            { label: 'Très Grand (5xl)', value: 'xl' },
          ],
        },
        align: {
          type: 'radio',
          label: 'Alignement',
          options: [
            { label: 'Gauche', value: 'left' },
            { label: 'Centre', value: 'center' },
            { label: 'Droite', value: 'right' },
          ],
        },
        color: {
          type: 'select',
          label: 'Couleur',
          options: [
            { label: 'Sombre', value: 'text-slate-900' },
            { label: 'Bleu #00A0FF', value: 'text-[#00A0FF]' },
            { label: 'Blanc', value: 'text-white' },
            { label: 'Violet', value: 'text-purple-600' },
          ],
        },
      },
      defaultProps: {
        title: 'Nouveau Titre de Section',
        size: 'large',
        align: 'center',
        color: 'text-slate-900',
      },
      render: ({ title, size, align, color }) => {
        const sizeClasses = {
          small: 'text-xl sm:text-2xl',
          medium: 'text-2xl sm:text-3xl',
          large: 'text-3xl sm:text-4xl',
          xl: 'text-4xl sm:text-5xl',
        };
        const alignClasses = {
          left: 'text-left',
          center: 'text-center',
          right: 'text-right',
        };

        return (
          <h2 className={`w-full font-black font-heading tracking-tight my-4 ${sizeClasses[size]} ${alignClasses[align]} ${color}`}>
            {title}
          </h2>
        );
      },
    },

    Text: {
      fields: {
        content: { type: 'textarea', label: 'Contenu du texte' },
        align: {
          type: 'radio',
          label: 'Alignement',
          options: [
            { label: 'Gauche', value: 'left' },
            { label: 'Centre', value: 'center' },
            { label: 'Droite', value: 'right' },
          ],
        },
        size: {
          type: 'select',
          label: 'Taille du texte',
          options: [
            { label: 'Normal (sm)', value: 'small' },
            { label: 'Moyen (base)', value: 'medium' },
            { label: 'Grand (lg)', value: 'large' },
          ],
        },
      },
      defaultProps: {
        content: 'Insérez ici votre paragraphe de présentation clair, concis et engageant.',
        align: 'center',
        size: 'medium',
      },
      render: ({ content, align, size }) => {
        const sizeClasses = {
          small: 'text-xs sm:text-sm',
          medium: 'text-sm sm:text-base',
          large: 'text-base sm:text-lg',
        };
        const alignClasses = {
          left: 'text-left',
          center: 'text-center',
          right: 'text-right',
        };

        return (
          <p className={`w-full text-slate-600 font-medium leading-relaxed my-3 ${sizeClasses[size]} ${alignClasses[align]}`}>
            {content}
          </p>
        );
      },
    },

    Button: {
      fields: {
        text: { type: 'text', label: 'Texte du bouton' },
        href: { type: 'text', label: 'Lien de redirection (URL)' },
        variant: {
          type: 'select',
          label: 'Style du bouton',
          options: [
            { label: 'Bleu Principal (#00A0FF)', value: 'primary' },
            { label: 'Noir Élégant', value: 'secondary' },
            { label: 'Contour (Outline)', value: 'outline' },
          ],
        },
        align: {
          type: 'radio',
          label: 'Alignement',
          options: [
            { label: 'Gauche', value: 'left' },
            { label: 'Centre', value: 'center' },
            { label: 'Droite', value: 'right' },
          ],
        },
      },
      defaultProps: {
        text: '👉 Obtenir mon accès maintenant',
        href: '#',
        variant: 'primary',
        align: 'center',
      },
      render: ({ text, href, variant, align }) => {
        const variantClasses = {
          primary: 'bg-[#00A0FF] hover:bg-[#0080FF] text-white border-transparent shadow-lg',
          secondary: 'bg-slate-900 hover:bg-slate-800 text-white border-transparent shadow-lg',
          outline: 'bg-transparent border-2 border-[#00A0FF] text-[#00A0FF] hover:bg-blue-50',
        };
        const alignClasses = {
          left: 'justify-start',
          center: 'justify-center',
          right: 'justify-end',
        };

        return (
          <div className={`w-full flex my-4 ${alignClasses[align]}`}>
            <a
              href={href}
              className={`px-7 py-3.5 rounded-2xl font-black text-sm transition-all hover:scale-105 cursor-pointer ${variantClasses[variant]}`}
            >
              {text}
            </a>
          </div>
        );
      },
    },

    Feature4ColImg: {
      fields: {
        item1Title: { type: 'text', label: 'Titre Col 1' },
        item1Desc: { type: 'textarea', label: 'Desc Col 1' },
        item1Img: { type: 'text', label: 'Image Col 1' },
        item2Title: { type: 'text', label: 'Titre Col 2' },
        item2Desc: { type: 'textarea', label: 'Desc Col 2' },
        item2Img: { type: 'text', label: 'Image Col 2' },
        item3Title: { type: 'text', label: 'Titre Col 3' },
        item3Desc: { type: 'textarea', label: 'Desc Col 3' },
        item3Img: { type: 'text', label: 'Image Col 3' },
        item4Title: { type: 'text', label: 'Titre Col 4' },
        item4Desc: { type: 'textarea', label: 'Desc Col 4' },
        item4Img: { type: 'text', label: 'Image Col 4' },
        imgHeight: { type: 'number', label: 'Hauteur des images (px)' },
        borderRadius: { type: 'number', label: 'Arrondissement (px)' },
      },
      defaultProps: {
        item1Title: 'BASES',
        item1Desc: 'Masterisez les fondations essentielles de la réussite.',
        item1Img: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=400&q=80',
        item2Title: 'CUISINER',
        item2Desc: 'Recettes et formules étape par étape prêtes à l emploi.',
        item2Img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
        item3Title: 'EXTÉRIEUR',
        item3Desc: 'Développez votre visibilité et votre autorité externe.',
        item3Img: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80',
        item4Title: 'DRESSAGE',
        item4Desc: 'Optimisez vos processus et automatisez vos résultats.',
        item4Img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80',
        imgHeight: 240,
        borderRadius: 16,
      },
      render: ({
        item1Title, item1Desc, item1Img,
        item2Title, item2Desc, item2Img,
        item3Title, item3Desc, item3Img,
        item4Title, item4Desc, item4Img,
        imgHeight, borderRadius,
      }) => {
        const items = [
          { title: item1Title, desc: item1Desc, img: item1Img },
          { title: item2Title, desc: item2Desc, img: item2Img },
          { title: item3Title, desc: item3Desc, img: item3Img },
          { title: item4Title, desc: item4Desc, img: item4Img },
        ];

        return (
          <div className="w-full my-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {items.map((col, i) => (
                <div key={i} className="flex flex-col items-center text-center space-y-3">
                  <div
                    className="w-full overflow-hidden shadow-md border border-slate-100"
                    style={{ height: `${imgHeight || 240}px`, borderRadius: `${borderRadius || 16}px` }}
                  >
                    <img src={col.img} alt={col.title} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-heading font-black text-sm tracking-wider uppercase text-slate-900">
                    {col.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {col.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      },
    },

    Feature3ColImg: {
      fields: {
        item1Title: { type: 'text', label: 'Titre Col 1' },
        item1Desc: { type: 'textarea', label: 'Desc Col 1' },
        item1Img: { type: 'text', label: 'Image Col 1' },
        item2Title: { type: 'text', label: 'Titre Col 2' },
        item2Desc: { type: 'textarea', label: 'Desc Col 2' },
        item2Img: { type: 'text', label: 'Image Col 2' },
        item3Title: { type: 'text', label: 'Titre Col 3' },
        item3Desc: { type: 'textarea', label: 'Desc Col 3' },
        item3Img: { type: 'text', label: 'Image Col 3' },
        imgHeight: { type: 'number', label: 'Hauteur des images (px)' },
        borderRadius: { type: 'number', label: 'Arrondissement (px)' },
      },
      defaultProps: {
        item1Title: 'STRATÉGIE CLAIRE',
        item1Desc: 'Des plans d action détaillés pour accélérer vos revenus.',
        item1Img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80',
        item2Title: 'CAPTURE DE LEADS',
        item2Desc: 'Attirez des prospects qualifiés prêts à acheter.',
        item2Img: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=400&q=80',
        item3Title: 'CONVERSION HAUTE',
        item3Desc: 'Maximisez votre taux de transformation avec nos modèles.',
        item3Img: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=400&q=80',
        imgHeight: 260,
        borderRadius: 20,
      },
      render: ({
        item1Title, item1Desc, item1Img,
        item2Title, item2Desc, item2Img,
        item3Title, item3Desc, item3Img,
        imgHeight, borderRadius,
      }) => {
        const items = [
          { title: item1Title, desc: item1Desc, img: item1Img },
          { title: item2Title, desc: item2Desc, img: item2Img },
          { title: item3Title, desc: item3Desc, img: item3Img },
        ];

        return (
          <div className="w-full my-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {items.map((col, i) => (
                <div key={i} className="flex flex-col items-center text-center space-y-3">
                  <div
                    className="w-full overflow-hidden shadow-md border border-slate-100"
                    style={{ height: `${imgHeight || 260}px`, borderRadius: `${borderRadius || 20}px` }}
                  >
                    <img src={col.img} alt={col.title} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-heading font-black text-sm tracking-wider uppercase text-slate-900">
                    {col.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {col.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      },
    },

    Card: {
      fields: {
        title: { type: 'text', label: 'Titre de la carte' },
        content: { type: 'textarea', label: 'Texte intérieur' },
        bgColor: {
          type: 'select',
          label: 'Couleur de fond',
          options: [
            { label: 'Blanc Pur', value: 'bg-white text-slate-900' },
            { label: 'Bleu Clair', value: 'bg-blue-50/80 text-slate-900 border-blue-200' },
            { label: 'Sombre Ébène', value: 'bg-slate-900 text-white border-slate-800' },
          ],
        },
        borderColor: { type: 'text', label: 'Classe bordure Tailwind' },
      },
      defaultProps: {
        title: '💡 Conseil Pro',
        content: 'Présentez vos arguments clés sous forme de carte lisible et attrayante.',
        bgColor: 'bg-white text-slate-900',
        borderColor: 'border-slate-200',
      },
      render: ({ title, content, bgColor, borderColor }) => (
        <div className={`w-full p-6 my-4 rounded-3xl border shadow-lg space-y-3 ${bgColor} ${borderColor}`}>
          {title && <h4 className="font-heading font-black text-lg">{title}</h4>}
          <p className="text-sm font-medium leading-relaxed opacity-90">{content}</p>
        </div>
      ),
    },

    LeadForm: {
      fields: {
        title: { type: 'text', label: 'Titre du formulaire' },
        subtitle: { type: 'textarea', label: 'Sous-titre d accroche' },
        buttonText: { type: 'text', label: 'Texte du bouton Valider' },
        redirectUrl: { type: 'text', label: 'URL de remerciement' },
      },
      defaultProps: {
        title: 'Recevez votre Guide Offert 🎁',
        subtitle: 'Entrez votre prénom et email ci-dessous pour recevoir l accès immédiat.',
        buttonText: 'Télécharger mon guide gratuit',
        redirectUrl: '#',
      },
      render: ({ title, subtitle, buttonText }) => (
        <div className="w-full max-w-lg mx-auto my-8 p-8 bg-white rounded-3xl border border-slate-200 shadow-2xl text-center space-y-5">
          <div className="space-y-2">
            <h3 className="font-heading font-black text-2xl text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
          </div>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-3.5">
            <input
              type="text"
              placeholder="Votre Prénom..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-[#00A0FF]"
            />
            <input
              type="email"
              placeholder="Votre Adresse Email..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-[#00A0FF]"
            />
            <button
              type="submit"
              className="w-full py-4 bg-[#00A0FF] hover:bg-[#0080FF] text-white font-black text-xs rounded-xl shadow-lg transition-all"
            >
              {buttonText}
            </button>
          </form>
        </div>
      ),
    },

    VideoEmbed: {
      fields: {
        videoUrl: { type: 'text', label: 'Lien Vidéo (YouTube / MP4)' },
        caption: { type: 'text', label: 'Légende sous la vidéo' },
      },
      defaultProps: {
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        caption: 'Vidéo de démonstration en direct',
      },
      render: ({ videoUrl, caption }) => (
        <div className="w-full max-w-3xl mx-auto my-8 space-y-2 text-center">
          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-black">
            <iframe
              src={videoUrl}
              title="Vidéo Embed"
              className="w-full h-full border-0"
              allowFullScreen
            />
          </div>
          {caption && <p className="text-xs text-slate-500 font-bold italic">{caption}</p>}
        </div>
      ),
    },
  },
};
