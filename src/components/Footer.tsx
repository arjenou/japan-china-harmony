const Footer = () => {
  return (
    <footer className="gradient-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">上海英物国際貿易有限会社</h3>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              世界の"いいモノ"を作りに
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">サービス</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>アジア工場との橋渡し</li>
              <li>小ロット対応</li>
              <li>OEM/ODM</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">お問い合わせ</h4>
            <p className="text-sm text-primary-foreground/80">
              電話: +86-21-XXXX-XXXX<br />
              メール: info@eimono-trade.com
            </p>
          </div>
        </div>
        
        <div className="pt-8 border-t border-primary-foreground/20 text-center text-sm text-primary-foreground/80">
          <p>&copy; {new Date().getFullYear()} 上海英物国際貿易有限会社. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
