import localFont from 'next/font/local';

export const openSans = localFont({
  src: [
    {
      path: '../../public/OpenSans-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/OpenSans-Bold.ttf',
      weight: '700',
      style: 'normal',
    }
  ],
  variable: '--font-opensans'
});

export const montserrat = localFont({
  src: [
    {
      path: '../../public/Montserrat-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/Montserrat-Bold.ttf',
      weight: '700',
      style: 'normal',
    }
  ],
  variable: '--font-montserrat'
}); 