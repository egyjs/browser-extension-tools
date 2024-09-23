import { github } from '../Tools';

const main = async () => {
  const url = window.location.href;
  const pattern = /^https:\/\/github.com\/.*\/.*\/releases\/new$/;

  if (pattern.test(url)) {
    github.release();
  }


};

// @ts-ignore
window.navigation.addEventListener('navigate', () => {
  main();
});

main();

export {};