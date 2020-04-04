const puppeteer = require('puppeteer');
const rl = require('readline-sync');
 
(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await page.goto('http://jti.polije.ac.id/elearning/login/index.php', {waitUntil: 'networkidle2'});
  const nim = rl.question('NIM : ');

  const username = await page.$('input[name=username]');
  const password = await page.$('input[name=password]');
  await username.focus();
  await username.type(nim);
  await password.focus();
  await password.type('jtipolije');
  const button = await page.$('#loginbtn');
  await button.click();
  await page.waitForNavigation();
  
  if(page.url() === 'http://jti.polije.ac.id/elearning/login/index.php'){
  } else{
    const nama = await page.$eval('.dropdown-toggle.usermendrop', el => el.innerText);
    console.log(`Selamat Datang ${nama}`);
    await page.goto('http://jti.polije.ac.id/elearning/calendar/view.php',{waitUntil: 'networkidle2'});
    // const div_judul = await page.$$eval('h3.name.d-inline-block', nodes => nodes.map(n => n.innerText));
    const card = await page.evaluate(() => {
      const data = Array.from(document.querySelectorAll('.calendar_event_attendance'), e => {
        const tanggal = e.offsetParent.children[0].children[3].innerText;
        const nama = e.children[2].innerText;
        const link = e.children[2].children[0].href;

        return {tanggal,nama,link}
      }) ;
      return data;
    });
    
    console.log({absensi : card});
  }
  
  // await browser.close();
})();