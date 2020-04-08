const puppeteer = require('puppeteer');
const fs = require('fs');
const readline = require('readline');
const chalk = require('chalk');



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
      const data = Array.from(document.querySelectorAll('.calendar_event_attendance>div>a'), e => {
        const tanggal = e.offsetParent.children[0].children[3].innerText;
        const nama = e.text;
        const link = e.href;

        return {tanggal,nama,link}
      }) ;
      return data;
    });
    
    return card;
  };

  let sukses = 0;
  let gagal = 0;
  const txt = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of txt) {
    // Each line in input.txt will be successively available here as `line`.
    if(line === ''){
      continue;
    }

    const nim = `e4117${line}`;
    console.log(`[+]${nim} Login...`);
    const wat = await login(nim);
    if(wat === true){
      const nama = await page.$eval('.dropdown-toggle.usermendrop', el => el.innerText);
      console.log(chalk.green(`[+]Sukses Login ${nama}`));
      sukses++;

      const absen = await list_absen();
      console.log(chalk.cyan(`[#]${absen.length} Absen Yang Ada`));
      for(let i = 0; i < absen.length; i++){
        await page.goto(absen[i].link,{waitUntil: 'networkidle2'});
        const link_absen = await page.evaluate(() => {
          const data = Array.from(document.querySelectorAll('.statuscol.cell.c2.lastcol[colspan="3"]'), e => {
            const link = e.firstElementChild.href;
            return {link};
          }) ;
          return data;
        });      
        console.log(chalk.cyan(`==>[${i+1}] ${absen[i].nama}: ${link_absen.length} Yang Bisa Diakses`));
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
      console.log(chalk.blue(`[+]Logout ${nama}...`));
      await logout();
    } else{
      console.log(chalk.red('[-]'+nim+' Gagal Login'));
      gagal++;
    }    
  }  
  console.log(`Berhasil : ${sukses}`);
  console.log(`Gagal : ${gagal}`);
  console.log('Selesai..');
  await process.exit(1);
})();