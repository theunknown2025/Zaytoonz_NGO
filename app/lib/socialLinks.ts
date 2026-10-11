export interface SocialLink {
  key: string;
  title: string;
  description: string;
  href: string;
  qr: string;
  scanText: string;
  ariaLabel: string;
  gradient: string;
  iconPath: string;
}

const GROUP_ICON =
  'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z';

export const SOCIAL_LINKS: SocialLink[] = [
  {
    key: 'whatsapp',
    title: 'WhatsApp',
    description: 'Community Chat',
    href: 'https://chat.whatsapp.com/GlJyFL0Cxvm3AYUQRP4b9G',
    qr: '/sm/zz-whatsapp.png',
    scanText: 'Scan to Join',
    ariaLabel: 'Join our WhatsApp community chat',
    gradient: 'linear-gradient(135deg, #25d366, #128c7e)',
    iconPath:
      'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z',
  },
  {
    key: 'telegram',
    title: 'Telegram',
    description: 'Channel',
    href: 'https://t.me/zaytoonz',
    qr: '/sm/zz-telegram.png',
    scanText: 'Scan to Join',
    ariaLabel: 'Join our Telegram channel',
    gradient: 'linear-gradient(135deg, #0088cc, #229ed9)',
    iconPath:
      'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z',
  },
  {
    key: 'facebook',
    title: 'Facebook',
    description: 'Official Page',
    href: 'https://www.facebook.com/zaytoonz/',
    qr: '/sm/zz-facebook.png',
    scanText: 'Scan to Follow',
    ariaLabel: 'Follow our Facebook page',
    gradient: 'linear-gradient(135deg, #1877f2, #3b5998)',
    iconPath:
      'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  },
  {
    key: 'linkedin',
    title: 'LinkedIn',
    description: 'Company Page',
    href: 'https://www.linkedin.com/company/zaytoonz/',
    qr: '/sm/zz-linkedin.png',
    scanText: 'Scan to Connect',
    ariaLabel: 'Connect on LinkedIn company page',
    gradient: 'linear-gradient(135deg, #0077b5, #00a0dc)',
    iconPath:
      'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
  {
    key: 'facebook-group',
    title: 'FB Group',
    description: 'Community',
    href: 'https://www.facebook.com/groups/654692163266122',
    qr: '/sm/zz-facebookgroupe.png',
    scanText: 'Scan to Join',
    ariaLabel: 'Join our Facebook community group',
    gradient: 'linear-gradient(135deg, #1877f2, #4267b2)',
    iconPath: GROUP_ICON,
  },
  {
    key: 'linkedin-group',
    title: 'LI Group',
    description: 'Networking',
    href: 'https://www.linkedin.com/groups/12864122/',
    qr: '/sm/zz-linkedin.png',
    scanText: 'Scan to Join',
    ariaLabel: 'Join our LinkedIn networking group',
    gradient: 'linear-gradient(135deg, #0077b5, #005582)',
    iconPath: GROUP_ICON,
  },
];
