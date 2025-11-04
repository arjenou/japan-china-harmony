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
      process: '业务流程',
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
    processFlow: {
      title: '业务流程',
      step1: {
        title: '咨询与提案',
        subtitle: '咨询与提案',
        description: '倾听每位客户的个性化需求，以诚挚的提案创造与产品的珍贵相遇。',
      },
      step2: {
        title: '样品制作',
        subtitle: '样品制作',
        description: '严格按照客户期望的规格进行制造。',
      },
      step3: {
        title: '报价',
        subtitle: '报价',
        description: '根据客户需求，制作详细的报价单。',
      },
      step4: {
        title: '接单',
        subtitle: '接单',
        description: '当客户对样品满意后，我们将接受正式订单。',
      },
      step5: {
        title: '签约',
        subtitle: '签约',
        description: '确认交易细节，签订正式合同。',
      },
      step6: {
        title: '正式生产',
        subtitle: '正式生产',
        description: '与合作伙伴协作，生产具有竞争力的优质产品。从材料采购到组装工序，全部在工厂完成。',
      },
      step7: {
        title: '检品/检针',
        subtitle: '检品/检针',
        description: '使用检针器或目视检查，对每件产品进行逐一检验。',
      },
      step8: {
        title: '交付',
        subtitle: '交付',
        description: '将产品送达客户手中。',
      },
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
      errorTitle: '发送失败',
      errorMessage: '发送邮件时出现错误，请稍后重试。',
      sending: '发送中...',
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
      process: '業務フロー',
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
    processFlow: {
      title: '業務フロー',
      step1: {
        title: 'ご相談&ご提案',
        subtitle: 'ご相談&ご提案',
        description: 'お取引様はじめ、個々のニーズに耳を傾ける心のこもった提案で、商品とのかけがえのない出会いを創出します。',
      },
      step2: {
        title: 'サンプル作成',
        subtitle: 'サンプル作成',
        description: 'お取引様が望まれる仕様通りに製造しております。',
      },
      step3: {
        title: 'お見積り',
        subtitle: 'お見積り',
        description: 'お客様のご要望に基づき、詳細なお見積りを作成いたします。',
      },
      step4: {
        title: '受注',
        subtitle: '受注',
        description: 'お取引様納得のサンプルに仕上りましたら商品として注文法文をお受けします。',
      },
      step5: {
        title: 'ご契約',
        subtitle: 'ご契約',
        description: 'お取引の詳細を確認し、正式なご契約を締結いたします。',
      },
      step6: {
        title: '本生産',
        subtitle: '本生産',
        description: 'パートナーの皆様と協力しながら、競争力のある魅力的な商品を生産しております。資材の手配など…組み上けの工程全て工場で行ない仕上げます。',
      },
      step7: {
        title: '検品/検針',
        subtitle: '検品/検針',
        description: '検針器又は目視により１つ１つ検品いたします。',
      },
      step8: {
        title: '納品',
        subtitle: '納品',
        description: 'お取引様のもとへ商品が届きます。',
      },
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
      errorTitle: '送信失敗',
      errorMessage: 'メール送信中にエラーが発生しました。後ほどお試しください。',
      sending: '送信中...',
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
      process: 'Process',
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
    processFlow: {
      title: 'Business Process',
      step1: {
        title: 'Consultation & Proposal',
        subtitle: 'Consultation & Proposal',
        description: 'We listen to each client\'s individual needs and create heartfelt proposals that lead to invaluable encounters with products.',
      },
      step2: {
        title: 'Sample Creation',
        subtitle: 'Sample Creation',
        description: 'We manufacture according to the specifications desired by our clients.',
      },
      step3: {
        title: 'Quotation',
        subtitle: 'Quotation',
        description: 'We prepare a detailed quotation based on your requirements.',
      },
      step4: {
        title: 'Order Acceptance',
        subtitle: 'Order Acceptance',
        description: 'Once you are satisfied with the sample, we will accept your formal order.',
      },
      step5: {
        title: 'Contract',
        subtitle: 'Contract',
        description: 'We confirm the transaction details and conclude a formal contract.',
      },
      step6: {
        title: 'Full Production',
        subtitle: 'Full Production',
        description: 'We collaborate with our partners to produce competitive and attractive products. All processes, from material procurement to assembly, are completed at the factory.',
      },
      step7: {
        title: 'Inspection / Needle Detection',
        subtitle: 'Inspection / Needle Detection',
        description: 'We inspect each product individually using needle detectors or visual inspection.',
      },
      step8: {
        title: 'Delivery',
        subtitle: 'Delivery',
        description: 'Products are delivered to our clients.',
      },
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
      errorTitle: 'Sending failed',
      errorMessage: 'An error occurred while sending the email. Please try again later.',
      sending: 'Sending...',
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

