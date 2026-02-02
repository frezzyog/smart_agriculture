'use client'

import React from 'react'
import {
    ChevronLeft,
    Sprout,
    Layers,
    CheckCircle2,
    Droplets,
    Wind,
    ShoppingCart,
    ArrowRight,
    Search,
    BookOpen
} from 'lucide-react'
import Link from 'next/link'

import { useTranslation } from 'react-i18next'

export default function LettuceGuide() {
    const { i18n } = useTranslation()
    const lang = i18n.language === 'km' ? 'kh' : 'en'

    const content = {
        en: {
            title: "Lettuce Farming Process in Cambodia",
            subtitle: "A comprehensive guide to sustainable and organic lettuce cultivation.",
            overview: "Cambodian lettuce farming is influenced by the country's tropical climate, with distinct wet (May-October) and dry (November-April) seasons. Lettuce thrives best in the dry/cool period to avoid heat stress and bolting.",
            steps: [
                {
                    id: 1,
                    title: "Crop and Seed Selection",
                    icon: Sprout,
                    color: "text-emerald-400",
                    bg: "bg-emerald-400/10",
                    description: "Farmers select lettuce varieties suited to Cambodia's humid, warm conditions (25-30°C).",
                    details: [
                        "Popular varieties: Sa Ang (heat-tolerant), Sakata, or Rijk Zwaan.",
                        "Organic priority: Non-GMO, chemical-free seeds for premium pricing.",
                        "Intercropping: Sustainable models intercrop with mung beans (nitrogen) and corn (shade).",
                        "Maturity: Varieties typically mature in 35-45 days."
                    ]
                },
                {
                    id: 2,
                    title: "Land and Soil Preparation",
                    icon: Layers,
                    color: "text-amber-400",
                    bg: "bg-amber-400/10",
                    description: "Sandy, nutrient-poor soils require amendment 2-4 weeks before planting.",
                    details: [
                        "Raised beds: 1-1.2m wide, 5-10m long to prevent waterlogging.",
                        "Organic matter: Incorporate compost, manure, rice husk ash, and lime (pH 6.0-7.0).",
                        "Infrastructure: 144m² greenhouses or open fields with micro-irrigation.",
                        "Conservation: Minimal tillage to sustain long-term yields."
                    ]
                },
                {
                    id: 3,
                    title: "Planting",
                    icon: CheckCircle2,
                    color: "text-blue-400",
                    bg: "bg-blue-400/10",
                    description: "Direct seeding is common for efficiency, though transplanting is used for resilience.",
                    details: [
                        "Direct Seeding: 0.4-0.5cm deep, 18-30cm spacing between plants.",
                        "Transplanting: Start in nurseries for 2-3 weeks before moving to fields.",
                        "Density: Aim for 7-12 plants per square meter.",
                        "Timing: Best in dry/cool season with interplanted shade crops."
                    ]
                },
                {
                    id: 4,
                    title: "Cultivation and Maintenance",
                    icon: Droplets,
                    color: "text-cyan-400",
                    bg: "bg-cyan-400/10",
                    description: "Care focuses on consistent moisture and organic nutrient management.",
                    details: [
                        "Irrigation: Micro-sprinklers/drip systems (25-50mm/week).",
                        "Fertilization: Organic manure/compost; natural nitrogen from mung beans.",
                        "Pest Management: Use natural repellents (neem) and crop rotation.",
                        "Monitoring: Manual weeding and successive planting every 3 weeks."
                    ]
                },
                {
                    id: 5,
                    title: "Harvesting",
                    icon: Wind,
                    color: "text-purple-400",
                    bg: "bg-purple-400/10",
                    description: "Harvest when heads are firm, typically 40-60 days after planting.",
                    details: [
                        "Timing: 8-9 AM to avoid wilting; early harvest prevents bitter taste (bolting).",
                        "Method: Uproot whole plants or cut at the base.",
                        "Yields: Can reach 100kg daily from 500 managed beds."
                    ]
                },
                {
                    id: 6,
                    title: "Post-Harvest Handling",
                    icon: BookOpen,
                    color: "text-indigo-400",
                    bg: "bg-indigo-400/10",
                    description: "Quality control is crucial for market access, especially for tourism.",
                    details: [
                        "Processing: Wash, trim, and sort by size/quality immediately.",
                        "Cooling: Cool immediately to extend shelf life (2-3 days ambient).",
                        "Certification: Regular testing for contaminants ensures export quality."
                    ]
                },
                {
                    id: 7,
                    title: "Selling to Market",
                    icon: ShoppingCart,
                    color: "text-rose-400",
                    bg: "bg-rose-400/10",
                    description: "Lettuce fetches premium prices ($0.25 - $2.00/kg), higher for organic.",
                    details: [
                        "Channels: Local markets, hotels (Siem Reap), and organic stores (CEDAC).",
                        "Direct Delivery: Use apps/cooperatives to bypass middlemen.",
                        "Economic Impact: $1,575/ha earnings vs $307/ha for rice."
                    ]
                }
            ]
        },
        kh: {
            title: "ទិដ្ឋភាពទូទៅនៃការដាំស្លឹកខាត់ណានៅកម្ពុជា",
            subtitle: "មគ្គុទ្ទេសក៍គ្រប់ជ្រុងជ្រោយសម្រាប់ការដាំដុះសាឡាត់ប្រកបដោយនិរន្តរភាព និងសរីរាង្គ។",
            overview: "ការដាំស្លឹកខាត់ណា (សាឡាត់) ត្រូវបានជះឥទ្ធិពលដោយអាកាសធាតុត្រូពិច ដែលមានរដូវវស្សា និងរដូវប្រាំង។ ដាំល្អបំផុតនៅរដូវប្រាំង/ត្រជាក់ ដើម្បីជៀសវាងកំដៅខ្លាំង។",
            steps: [
                {
                    id: 1,
                    title: "ការជ្រើសរើសពូជ និងគ្រាប់ពូជ",
                    icon: Sprout,
                    color: "text-emerald-400",
                    bg: "bg-emerald-400/10",
                    description: "កសិករជ្រើសរើសពូជដែលសមស្របនឹងអាកាសធាតុសើម និងក្តៅ (២៥-៣០ អង្សាសេ)។",
                    details: [
                        "ពូជពេញនិយម៖ Sa Ang (ធន់នឹងកំដៅ), Sakata ឬ Rijk Zwaan។",
                        "កសិកម្មសរីរាង្គ៖ ជ្រើសរើសគ្រាប់ពូជមិនប្រែប្រួលហ្សែន (non-GMO) គ្មានគីមី។",
                        "ការដាំច្របូកច្របល់៖ ដាំជាមួយសណ្តែកបាយ (អាសូត) និងពោត (ផ្តល់ម្លប់)។",
                        "រយៈពេលប្រមូលផល៖ ភាគច្រើនចេញផលក្នុង ៣៥-៤៥ ថ្ងៃ។"
                    ]
                },
                {
                    id: 2,
                    title: "ការរៀបចំដី",
                    icon: Layers,
                    color: "text-amber-400",
                    bg: "bg-amber-400/10",
                    description: "ដីខ្សាច់កង្វះសារធាតុចិញ្ចឹម ត្រូវរៀបចំ ២-៤ សប្តាហ៍មុនដាំ។",
                    details: [
                        "ការលើករង្វះ៖ ទទឹង ១-១.២ម បណ្តោយ ៥-១០ម ដើម្បីជៀសវាងការលិចទឹក។",
                        "សារធាតុសរីរាង្គ៖ ប្រើជីកំប៉ុស លាមកសត្វ ផេះអង្កាម និងកំបោរស (pH ៦.០-៧.០)។",
                        "ហេដ្ឋារចនាសម្ព័ន្ធ៖ ប្រើផ្ទះកញ្ចក់ ១៤៤ ម៉ែត្រការ៉េ ឬវាលបើកចំហជាមួយប្រព័ន្ធស្រោចស្រពតូច។",
                        "ការការពារដី៖ កាត់បន្ថយការភ្ជួររាស់ ដើម្បីរក្សានិរន្តរភាពដី។"
                    ]
                },
                {
                    id: 3,
                    title: "ការដាំដុះ",
                    icon: CheckCircle2,
                    color: "text-blue-400",
                    bg: "bg-blue-400/10",
                    description: "ការដាំផ្ទាល់ជាទូទៅនៅកម្ពុជាដើម្បីសន្សំពេលវេលា ប៉ុន្តែការស្ទូងក៏ត្រូវបានប្រើប្រាស់ដែរ។",
                    details: [
                        "ដាំផ្ទាល់៖ ជម្រៅ ០.៤-០.៥ សង់ទីម៉ែត្រ ចន្លោះដើម ១៨-៣០ សង់ទីម៉ែត្រ។",
                        "ការស្ទូង៖ ដាំក្នុងគ្រែកូនសាច់ ២-៣ សប្តាហ៍ រួចទើបយកទៅដាំក្នុងវាល។",
                        "ដង់ស៊ីតេ៖ ៧-១២ ដើមក្នុងមួយម៉ែត្រការ៉េ។",
                        "ពេលវេលា៖ ដាំនៅរដូវប្រាំង/ត្រជាក់ ជាមួយដំណាំផ្តល់ម្លប់។"
                    ]
                },
                {
                    id: 4,
                    title: "ការថែទាំ",
                    icon: Droplets,
                    color: "text-cyan-400",
                    bg: "bg-cyan-400/10",
                    description: "ផ្តោតលើការផ្តល់សំណើមជាប់លាប់ និងការគ្រប់គ្រងជីសរីរាង្គ។",
                    details: [
                        "ការស្រោចទឹក៖ ប្រើប្រព័ន្ធស្រោចតូច (២៥-៥០ ម.ម/សប្តាហ៍)។",
                        "ការដាក់ជី៖ ប្រើជីសរីរាង្គ ឬកំប៉ុស និងអាសូតធម្មជាតិពីសណ្តែកបាយ។",
                        "គ្រប់គ្រងសត្វល្អិត៖ ប្រើថ្នាំផ្សំពីធម្មជាតិ (ស្ដៅ) និងការបង្វិលដំណាំ។",
                        "ការតាមដាន៖ បោចស្មៅដោយដៃ និងដាំបន្តបន្ទាប់រៀងរាល់ ៣ សប្តាហ៍។"
                    ]
                },
                {
                    id: 5,
                    title: "ការប្រមូលផល",
                    icon: Wind,
                    color: "text-purple-400",
                    bg: "bg-purple-400/10",
                    description: "ប្រមូលនៅពេលក្បាលរឹង និងពេញវ័យ (៤០-៦០ ថ្ងៃក្រោយដាំ)។",
                    details: [
                        "ពេលវេលា៖ ម៉ោង ៨-៩ ព្រឹក ដើម្បីជៀសវាងការស្រពោន និងការចេញផ្កាមុនអាយុ។",
                        "វិធីសាស្ត្រ៖ ដកទាំងឫស ឬកាត់ផ្នែកខាងក្រោម។",
                        "ទិន្នផល៖ អាចបាន ១០០ គីឡូក្រាមក្នុងមួយថ្ងៃពី ៥០០ គ្រែ។"
                    ]
                },
                {
                    id: 6,
                    title: "ការកែច្នៃក្រោយប្រមូលផល",
                    icon: BookOpen,
                    color: "text-indigo-400",
                    bg: "bg-indigo-400/10",
                    description: "ការត្រួតពិនិត្យគុណភាពមានសារៈសំខាន់សម្រាប់ទីផ្សារទេសចរណ៍។",
                    details: [
                        "ការសម្អាត៖ លាង កាត់ស្លឹកខូច និងតម្រៀបតាមទំហំភ្លាមៗ។",
                        "ការរក្សាទុក៖ ធ្វើឱ្យត្រជាក់ភ្លាមៗ (រក្សាបាន ២-៣ ថ្ងៃនៅសីតុណ្ហភាពធម្មតា)។",
                        "វិញ្ញាបនបត្រ៖ ការពិនិត្យសារធាតុពុលរៀងរាល់ ៣ ខែ ដើម្បីធានាគុណភាព។"
                    ]
                },
                {
                    id: 7,
                    title: "ការលក់ទៅទីផ្សារ",
                    icon: ShoppingCart,
                    color: "text-rose-400",
                    bg: "bg-rose-400/10",
                    description: "សាឡាត់មានតម្លៃខ្ពស់ (១,០០០-៨,០០០ រៀល/គីឡូក្រាម)។",
                    details: [
                        "បណ្តាញ៖ ទីផ្សារក្នុងស្រុក សណ្ឋាគារ (សៀមរាប) និងហាង CEDAC។",
                        "ការដឹកជញ្ជូន៖ ប្រើកម្មវិធីទូរស័ព្ទ ឬសហគមន៍ដើម្បីជៀសវាងឈ្មួញកណ្តាល។",
                        "សេដ្ឋកិច្ច៖ ចំណូល ១,៥៧៥ ដុល្លារ/ហិកតា ធៀបនឹង ៣០៧ ដុល្លារលើស្រូវ។"
                    ]
                }
            ]
        }
    }

    const t = content[lang]

    return (
        <div className="lg:ml-64 p-4 md:p-10 min-h-screen bg-background text-foreground transition-all duration-500">
            <div className="max-w-[1200px] mx-auto">
                {/* Header Navigation */}
                <div className="flex justify-between items-center mb-12">
                    <Link
                        href="/dashboard/guide"
                        className="flex items-center gap-2 text-foreground/50 hover:text-accent transition-colors font-bold text-xs uppercase tracking-widest group"
                    >
                        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Guides
                    </Link>
                </div>

                {/* Hero Section */}
                <div className="mb-16">
                    <span className="text-[10px] font-black text-accent uppercase tracking-[0.3em] mb-4 block">Comprehensive Guide</span>
                    <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter mb-6 leading-tight max-w-3xl">
                        {t.title}
                    </h1>
                    <p className="text-xl md:text-2xl text-foreground/40 font-medium leading-relaxed max-w-2xl italic">
                        "{t.subtitle}"
                    </p>
                </div>

                {/* Overview Card */}
                <div className="bg-card border border-border rounded-[2.5rem] p-8 md:p-12 mb-16 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent rounded-full blur-[150px] opacity-10 -mr-40 -mt-40"></div>
                    <div className="relative z-10">
                        <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                            <BookOpen className="text-accent" />
                            {lang === 'en' ? 'Process Overview' : 'ទិដ្ឋភាពទូទៅនៃដំណើរការ'}
                        </h3>
                        <p className="text-foreground/60 text-lg leading-relaxed font-medium">
                            {t.overview}
                        </p>
                    </div>
                </div>

                {/* Steps Timeline */}
                <div className="space-y-12">
                    {t.steps.map((step, index) => (
                        <div key={step.id} className="relative pl-8 md:pl-24 group">
                            {/* Connector Line */}
                            {index !== t.steps.length - 1 && (
                                <div className="absolute left-4 md:left-[2.75rem] top-12 bottom-0 w-px bg-border group-hover:bg-accent/30 transition-colors"></div>
                            )}

                            {/* Step Icon/Number */}
                            <div className={`absolute left-0 md:left-6 top-0 w-10 md:w-12 h-10 md:h-12 rounded-2xl ${step.bg} ${step.color} flex items-center justify-center z-10 group-hover:scale-110 transition-transform`}>
                                <step.icon size={20} />
                            </div>

                            {/* Content */}
                            <div className="bg-card/50 border border-border p-8 rounded-[2rem] hover:bg-foreground/[0.02] transition-all">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                    <h3 className="text-2xl font-black text-foreground">{step.title}</h3>
                                    <span className="text-[10px] font-black text-foreground/20 uppercase tracking-widest">Step 0{step.id}</span>
                                </div>
                                <p className="text-foreground/50 text-base font-medium mb-8 leading-relaxed">
                                    {step.description}
                                </p>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {step.details.map((detail, i) => (
                                        <li key={i} className="flex items-start gap-3 p-4 bg-foreground/[0.02] border border-border/50 rounded-xl hover:border-accent/30 transition-colors group/item">
                                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0 group-hover/item:scale-125 transition-transform"></div>
                                            <span className="text-sm font-bold text-foreground/70">{detail}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Final Call to Action */}
                <div className="mt-20 p-12 bg-accent rounded-[3rem] text-background flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative">
                    <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></div>
                    <div className="relative z-10 text-center md:text-left">
                        <h4 className="text-3xl font-black mb-4">Ready to start planting?</h4>
                        <p className="text-background/70 font-bold mb-0">Monitor your soil health and automation settings on the dashboard.</p>
                    </div>
                    <Link
                        href="/dashboard"
                        className="relative z-10 flex items-center gap-3 px-8 py-5 bg-background text-foreground rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-2xl"
                    >
                        Go to Dashboard
                        <ArrowRight size={20} />
                    </Link>
                </div>
            </div>
        </div>
    )
}
