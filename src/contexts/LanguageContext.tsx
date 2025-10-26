import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'zh' | 'ja' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // 从 localStorage 读取保存的语言，默认为日文
    const saved = localStorage.getItem('language') as Language;
    return saved || 'ja';
  });

  useEffect(() => {
    // 保存语言选择到 localStorage
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // 简单的翻译函数，从 translations 对象获取对应语言的文本
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// 翻译对象
const translations: Record<Language, any> = {
  zh: {
    nav: {
      home: '首页',
      philosophy: '企业理念',
      factories: '工厂介绍',
      services: '服务内容',
      products: '产品介绍',
      contact: '联系我们',
    },
    hero: {
      title: '上海英物国际贸易有限公司',
      subtitle: '世界的"好东西"制造商',
      description1: '在中国开展一站式制造与贸易业务。利用多年积累的优质工厂网络，从瑜伽服、功能性内衣、针织品、杂货到各种时尚配件的OEM/ODM，从小批量到大型量贩店批量灵活应对。',
      description2: '我们在动漫相关商品制造方面拥有丰富的实绩，年开发100+以上商品。',
      description3: '质量管理基于日企标准，可提供第三方检验服务。',
      contact: '联系我们',
    },
    philosophy: {
      title: '经营理念',
      philosophy1: {
        title: '少而精，让贵公司利益最大化',
        description: '削减中间成本，快速决策，为制造商和零售商双方的收益提升做贡献。',
      },
      philosophy2: {
        title: '三方共赢的贸易',
        description: '重视让供应商、客户和地球都满意的机制。',
      },
      philosophy3: {
        title: '坚持就是力量，变化就是机会',
        description: '用数据捕捉市场变化，积累小的改进，以成为长期合作伙伴为目标。',
      },
    },
    factories: {
      title: '合作工厂',
      factory1: {
        name: '太仓工厂',
        location: '江苏省太仓市',
        area: '2,000㎡',
        employees: '260名',
        engineers: '25名',
        inspectors: '20名',
      },
      factory2: {
        name: '安徽工厂',
        location: '据点数：2处',
        area: '5,000㎡',
        capacity: '高频焊接机焊接\n超声波缝纫机焊接对应',
      },
      labels: {
        location: '所在地',
        area: '面积',
        employees: '员工',
        engineers: '技术人员',
        inspectors: '检验员',
        capacity: '生产能力',
      },
    },
    services: {
      title: '主要服务',
      service1: {
        title: '亚洲工厂的桥梁',
        description: '中国 合作工厂5家以上',
      },
      service2: {
        title: '小批量对应',
        description: 'MOQ 100pcs～小批量对应，短交期（最短20天）',
      },
      service3: {
        title: 'OEM/ODM',
        description: '企划·设计·样品·生产·检验·进口·库存保管\n杂货不限，PSE对应实绩',
      },
    },
    products: {
      title: '产品介绍',
      searchTitle: '搜索',
      searchPlaceholder: '输入关键词',
      searchButton: '搜索',
      searchHint: '可按编号、名称等搜索',
      categoryTitle: '分类',
      resultsText: '件商品',
      itemsPerPage: '件',
      loading: '加载中...',
      noResults: '未找到商品',
      categories: {
        all: '全部',
        yoga: '瑜伽服装',
        yogaTools: '瑜伽用具',
        sports: '运动·休闲',
        functional: '功能性服装',
        bags: '包类',
        gloves: '手套和手套',
        goods: '杂货类',
        anime: '动漫类',
      },
    },
    productDetail: {
      backToList: '返回产品列表',
      notFound: '未找到商品',
      features: '产品特点',
      contactTitle: '咨询',
      contactDescription: '如有任何关于此产品的问题或订购需求，请随时联系我们。',
      contactButton: '联系我们',
      servicesTitle: '服务内容',
      service1: '✓ 支持小批量到大批量生产',
      service2: '✓ OEM/ODM服务',
      service3: '✓ 质量管理与检验',
      service4: '✓ 灵活的交货期',
      defaultFeature1: '使用高品质材料',
      defaultFeature2: '兼顾实用性和耐用性的设计',
      defaultFeature3: '适合日常使用',
      defaultFeature4: '可对应OEM/ODM',
    },
    contact: {
      title: '联系我们',
      name: '姓名',
      email: '电子邮箱',
      company: '公司名称',
      message: '咨询内容',
      send: '发送',
      companyInfo: '公司信息',
      companyName: '上海英物国际贸易有限公司',
      companyAddress: 'Office I, 15/F, Huamin Hanjun Tower, 726 Yan\'an West Road,\nChangning District, Shanghai, China 〒200050',
      phone: '电话',
      phoneValue: '013661548592',
      emailLabel: '电子邮箱',
      emailValue: 'eikoyang@mono-grp.com.cn',
      emailValue2: 'sandy_c@yiibi.top',
      mapViewLarge: '查看大地图',
      mapTitle: '上海英物国际贸易有限公司 地图',
      successTitle: '已收到您的咨询',
      successMessage: '我们的工作人员会尽快与您联系。',
      required: '*',
    },
    footer: {
      company: '上海英物国际贸易有限公司',
      tagline: '世界的"好东西"制造商',
      services: '服务',
      contact: '联系我们',
      phone: '电话',
      email: '电子邮箱',
      copyright: '版权所有',
    },
  },
  ja: {
    nav: {
      home: 'ホーム',
      philosophy: '企業理念',
      factories: '工場紹介',
      services: 'サービス',
      products: '商品紹介',
      contact: 'お問い合わせ',
    },
    hero: {
      title: '上海英物国際貿易有限会社',
      subtitle: '世界の"いいモノ"を作りに',
      description1: '中国では製造と貿易をワンストップで展開しております。長年にわたり培った優良工場ネットワークを活かし、ヨガウェア，機能性インナー，ニットウェア,雑貨・多種多様なファッション小物のOEM/ODMを、小ロットから大型量販店向けロットまで柔軟に対応しております。',
      description2: '当社ではアニメ関連グッズの製造の実績がございます。年間100+アイテム以上の開発実績がございます。',
      description3: '品質管理は日系企業基準に基づき、第三者による検品もご対応可能です。',
      contact: 'お問い合わせ',
    },
    philosophy: {
      title: '経営理念',
      philosophy1: {
        title: '少数精鋭だからこそ、御社の利益を最大化',
        description: '中間コストを削減し、スピーディーな意思決定で、メーカー様・小売様双方の収益向上に貢献します。',
      },
      philosophy2: {
        title: '三方よしのトレードを。',
        description: 'サプライヤーも、お客様も、地球も笑顔になる仕組みを大切にします。',
      },
      philosophy3: {
        title: '継続は力なり、変化はチャンスなり。',
        description: '市場の変化をデータで捉え、小さな改善を積み重ねることで、長くお付き合いいただけるパートナーを目指します。',
      },
    },
    factories: {
      title: '協力工場',
      factory1: {
        name: '太倉工場',
        location: '江蘇省太倉市',
        area: '2,000㎡',
        employees: '260名',
        engineers: '25名',
        inspectors: '20名',
      },
      factory2: {
        name: '安徽工場',
        location: '拠点数：2か所',
        area: '5,000㎡',
        capacity: '高周波ウェルダー溶着\n超音波ミシン溶着対応',
      },
      labels: {
        location: '所在地',
        area: '面積',
        employees: '従業員',
        engineers: '技術者',
        inspectors: '検査員',
        capacity: '生産能力',
      },
    },
    services: {
      title: '主要サービス',
      service1: {
        title: 'アジア工場との橋渡し',
        description: '中国 協力工場5社以上',
      },
      service2: {
        title: '小ロット対応',
        description: 'MOQ 100pcs～小ロット対応、短納期（最短20日）',
      },
      service3: {
        title: 'OEM/ODM',
        description: '企画・デザイン・サンプル・生産・検品・輸入・在庫保管まで\n雑貨問わず、PSE対応実績あり',
      },
    },
    products: {
      title: '製品紹介',
      searchTitle: '検索',
      searchPlaceholder: 'キーワードを入力',
      searchButton: '検索',
      searchHint: '品番、品名等で検索ができます',
      categoryTitle: 'カテゴリー',
      resultsText: '件の商品が見つかりました',
      itemsPerPage: '件',
      loading: '読み込み中...',
      noResults: '商品が見つかりませんでした',
      categories: {
        all: '全て',
        yoga: 'ヨガウェア',
        yogaTools: 'ヨガ用具',
        sports: 'スポーツ・レジャー',
        functional: '機能性ウェア',
        bags: 'バッグ類',
        gloves: '軍手と手袋',
        goods: '雑貨類',
        anime: 'アニメ類',
      },
    },
    productDetail: {
      backToList: '商品一覧に戻る',
      notFound: '商品が見つかりません',
      features: '商品の特徴',
      contactTitle: 'お問い合わせ',
      contactDescription: 'この商品についてのご質問やご注文については、お気軽にお問い合わせください。',
      contactButton: 'お問い合わせ',
      servicesTitle: 'サービス内容',
      service1: '✓ 小ロットから大量生産まで対応',
      service2: '✓ OEM/ODMサービス',
      service3: '✓ 品質管理と検査',
      service4: '✓ 柔軟な納期対応',
      defaultFeature1: '高品質な素材を使用',
      defaultFeature2: '実用性と耐久性を兼ね備えた設計',
      defaultFeature3: '日常使いに最適',
      defaultFeature4: 'OEM/ODM対応可能',
    },
    contact: {
      title: 'お問い合わせ',
      name: 'お名前',
      email: 'メールアドレス',
      company: '会社名',
      message: 'お問い合わせ内容',
      send: '送信する',
      companyInfo: '会社情報',
      companyName: '上海英物国際貿易有限会社',
      companyAddress: 'Office I, 15/F, Huamin Hanjun Tower, 726 Yan\'an West Road,\nChangning District, Shanghai, China 〒200050',
      phone: '電話',
      phoneValue: '013661548592',
      emailLabel: 'メール',
      emailValue: 'eikoyang@mono-grp.com.cn',
      emailValue2: 'sandy_c@yiibi.top',
      mapViewLarge: '大きな地図を表示',
      mapTitle: '上海英物国際貿易有限会社 地図',
      successTitle: 'お問い合わせを受け付けました',
      successMessage: '担当者より折り返しご連絡させていただきます。',
      required: '*',
    },
    footer: {
      company: '上海英物国際貿易有限会社',
      tagline: '世界の"いいモノ"を作りに',
      services: 'サービス',
      contact: 'お問い合わせ',
      phone: '電話',
      email: 'メール',
      copyright: 'すべての権利予約',
    },
  },
  en: {
    nav: {
      home: 'Home',
      philosophy: 'Philosophy',
      factories: 'Factories',
      services: 'Services',
      products: 'Products',
      contact: 'Contact',
    },
    hero: {
      title: 'Shanghai Yingwu International Trading Co., Ltd.',
      subtitle: 'Creating the Best Products in the World',
      description1: 'We provide one-stop manufacturing and trading services in China. Utilizing our excellent factory network accumulated over the years, we flexibly handle OEM/ODM for yoga wear, functional innerwear, knitwear, sundries, and various fashion accessories, from small lots to large-scale retail store orders.',
      description2: 'We have extensive experience in manufacturing anime-related products, with an annual development record of over 100+ items.',
      description3: 'Quality control is based on Japanese corporate standards, and third-party inspections are available.',
      contact: 'Contact Us',
    },
    philosophy: {
      title: 'Management Philosophy',
      philosophy1: {
        title: 'Lean Excellence for Maximum Profit',
        description: 'Reduce intermediate costs and make quick decisions to contribute to revenue improvement for both manufacturers and retailers.',
      },
      philosophy2: {
        title: 'Win-Win-Win Trade',
        description: 'We value mechanisms that make suppliers, customers, and the planet happy.',
      },
      philosophy3: {
        title: 'Persistence is Power, Change is Opportunity',
        description: 'Capture market changes with data and accumulate small improvements to become a long-term partner.',
      },
    },
    factories: {
      title: 'Partner Factories',
      factory1: {
        name: 'Taicang Factory',
        location: 'Taicang, Jiangsu Province',
        area: '2,000㎡',
        employees: '260 people',
        engineers: '25 people',
        inspectors: '20 people',
      },
      factory2: {
        name: 'Anhui Factory',
        location: 'Number of sites: 2',
        area: '5,000㎡',
        capacity: 'High-frequency welder welding\nUltrasonic sewing machine welding support',
      },
      labels: {
        location: 'Location',
        area: 'Area',
        employees: 'Employees',
        engineers: 'Engineers',
        inspectors: 'Inspectors',
        capacity: 'Production Capacity',
      },
    },
    services: {
      title: 'Main Services',
      service1: {
        title: 'Bridge to Asian Factories',
        description: 'China: Over 5 partner factories',
      },
      service2: {
        title: 'Small Lot Support',
        description: 'MOQ 100pcs~ Small lot support, Short delivery time (minimum 20 days)',
      },
      service3: {
        title: 'OEM/ODM',
        description: 'Planning, Design, Sampling, Production, Inspection, Import, Inventory Management\nVarious products, PSE compliance track record',
      },
    },
    products: {
      title: 'Products',
      searchTitle: 'Search',
      searchPlaceholder: 'Enter keywords',
      searchButton: 'Search',
      searchHint: 'Search by product number, name, etc.',
      categoryTitle: 'Category',
      resultsText: 'products found',
      itemsPerPage: 'items',
      loading: 'Loading...',
      noResults: 'No products found',
      categories: {
        all: 'All',
        yoga: 'Yoga Wear',
        yogaTools: 'Yoga Equipment',
        sports: 'Sports & Leisure',
        functional: 'Functional Wear',
        bags: 'Bags',
        gloves: 'Gloves',
        goods: 'General Goods',
        anime: 'Anime Products',
      },
    },
    productDetail: {
      backToList: 'Back to Products',
      notFound: 'Product not found',
      features: 'Product Features',
      contactTitle: 'Contact',
      contactDescription: 'For any questions or orders regarding this product, please feel free to contact us.',
      contactButton: 'Contact Us',
      servicesTitle: 'Services',
      service1: '✓ From small to large batch production',
      service2: '✓ OEM/ODM services',
      service3: '✓ Quality control and inspection',
      service4: '✓ Flexible delivery schedule',
      defaultFeature1: 'High quality materials',
      defaultFeature2: 'Design combining practicality and durability',
      defaultFeature3: 'Perfect for everyday use',
      defaultFeature4: 'OEM/ODM available',
    },
    contact: {
      title: 'Contact Us',
      name: 'Name',
      email: 'Email',
      company: 'Company',
      message: 'Message',
      send: 'Send',
      companyInfo: 'Company Information',
      companyName: 'Shanghai Yingwu International Trading Co., Ltd.',
      companyAddress: 'Office I, 15/F, Huamin Hanjun Tower, 726 Yan\'an West Road,\nChangning District, Shanghai, China 〒200050',
      phone: 'Phone',
      phoneValue: '013661548592',
      emailLabel: 'Email',
      emailValue: 'eikoyang@mono-grp.com.cn',
      emailValue2: 'sandy_c@yiibi.top',
      mapViewLarge: 'View larger map',
      mapTitle: 'Shanghai Yingwu International Trading Co., Ltd. Map',
      successTitle: 'Contact received',
      successMessage: 'Our staff will contact you as soon as possible.',
      required: '*',
    },
    footer: {
      company: 'Shanghai Yingwu International Trading Co., Ltd.',
      tagline: 'Creating the Best Products in the World',
      services: 'Services',
      contact: 'Contact',
      phone: 'Phone',
      email: 'Email',
      copyright: 'All Rights Reserved',
    },
  },
};

