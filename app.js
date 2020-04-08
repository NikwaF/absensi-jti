const puppeteer = require('puppeteer');
const fs = require('fs');
const readline = require('readline');



(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();  
  const fileStream = fs.createReadStream(`${__dirname}/nim.txt`);

  const login = async function(nim){
    await page.goto('http://jti.polije.ac.id/elearning/login/index.php', {waitUntil: 'networkidle2'});
  
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
      return false;
    } else{
      return true;
    }
  };


  const logout = async () => {
    const hreflogout = await page.$eval('a[title="Log out"]', el => el.href);
    await page.goto(hreflogout, {waitUntil: 'networkidle2'});
    // await page.waitForNavigation();  
    if(page.url() === 'http://jti.polije.ac.id/elearning/'){
      return true;
    } else{
      return false;
    }
  };

  const list_absen = async () => {
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
    
    return card;
  };

  
  const txt = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of txt) {
    // Each line in input.txt will be successively available here as `line`.
    const wat = await login(`e4117${line}`);
    if(wat === true){
      const nama = await page.$eval('.dropdown-toggle.usermendrop', el => el.innerText);
      console.log(`Sukses Login ${nama}`);

      const absen = await list_absen();
      
      for(let i = 0; i < absen.length; i++){
        await page.goto(absen[i].link,{waitUntil: 'networkidle2'});
        const link_absen = await page.evaluate(() => {
          const data = Array.from(document.querySelectorAll('.statuscol.cell.c2.lastcol[colspan="3"]'), e => {
            const link = e.firstElementChild.href;
            return {link};
          }) ;
          return data;
        });      

        if(link_absen.length === 0){
          continue;
        }
      
        for(let i =0; i < link_absen.length; i++){
          await page.goto(link_absen[i].link,{waitUntil: 'networkidle2'});
          await page.evaluate(() => {
            const test = document.querySelectorAll('fieldset.felement.fgroup>span>input')[0];
            test.click();
            document.querySelector('#id_submitbutton').click();
          });
        }
      }
      
      await logout();
    

      // await page.goto(card.link,{waitUntil: 'networkidle2'});

      // for(let i=0; i < absen.length; i++){
      //   await page.goto(absen[i].link,{waitUntil: 'networkidle2'});
      // }

      // const out = await logout();
      // if(out){
      //   console.log(`Sukses Logout ${nama}`);
      // } else{
      //   console.log(`Gagal Logout ${nama}`);
      // }
    } else{
      console.log('gagal login');
    }    
  }  

  



})();
 
// (async () => {
//   const browser = await puppeteer.launch({headless: true});
//   const page = await browser.newPage();
//   await page.goto('http://jti.polije.ac.id/elearning/login/index.php', {waitUntil: 'networkidle2'});
//   const nim = rl.question('NIM : ');

//   const username = await page.$('input[name=username]');
//   const password = await page.$('input[name=password]');
//   await username.focus();
//   await username.type(nim);
//   await password.focus();
//   await password.type('jtipolije');
//   const button = await page.$('#loginbtn');
//   await button.click();
//   await page.waitForNavigation();
  
//   if(page.url() === 'http://jti.polije.ac.id/elearning/login/index.php'){
//   } else{
//     const nama = await page.$eval('.dropdown-toggle.usermendrop', el => el.innerText);
//     console.log(`Selamat Datang ${nama}`);
//     await page.goto('http://jti.polije.ac.id/elearning/calendar/view.php',{waitUntil: 'networkidle2'});
//     // const div_judul = await page.$$eval('h3.name.d-inline-block', nodes => nodes.map(n => n.innerText));
//     const card = await page.evaluate(() => {
//       const data = Array.from(document.querySelectorAll('.calendar_event_attendance'), e => {
//         const tanggal = e.offsetParent.children[0].children[3].innerText;
//         const nama = e.children[2].innerText;
//         const link = e.children[2].children[0].href;

//         return {tanggal,nama,link}
//       }) ;
//       return data;
//     });
    
//     console.log({absensi : card});
//   }
  
//   // await browser.close();
// })();