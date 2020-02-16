const fs = require('fs');
const util = require('util');
const readline = require('readline');
const parse = require('csv-parse/lib/sync');
const stringify = require('csv-stringify');
const mongoose = require('mongoose');

process.on("unhandledRejection", function handleWarning( reason, promise ) {
  console.log("[PROCESS] Unhandled Promise Rejection");
  console.log( reason );
});

require('./models/Patient');
require('./models/Email');
require('dotenv').config({ path: 'variables.env' });
let emailTml = require('./data/emailTemplate').emailTemplate;
const Patient = require('./models/Patient');
const Email = require('./models/Email');


async function connectDB(){
	mongoose.connection.on('connected', () => {
	  console.log(`MONGOOSE CONNECTED!!`);
	});

	mongoose.connection.on('error', (err) => {
	  console.error(`MongoDB error → ${err.message}`);
	  process.exit();
	});

	// Connect to our Database and handle an bad connections
	await mongoose.connect(process.env.DATABASE, {
  		useNewUrlParser: true,
  		useUnifiedTopology: true
	}).catch( err => console.log(err));
}

async function loadDataToDb(data){
	Date.prototype.addDays = function(days) {
	    let date = new Date(this.valueOf());
	    date.setDate(date.getDate() + days);
	    return date;
	}
	let shdate = new Date();
	try {
		// await Patient.deleteMany();
  		// await Email.deleteMany();
  		// console.log("Data deleted from Db");
	    await Patient.insertMany(data);
	    const shList = await Patient.find({ con: 'Y', email: {$ne: ""}});

	    //create schedule
	    for (let shPat of shList){
	    	for (let i = 0;i < emailTml.length; i++){
		    	let etmpl = emailTml[i];
		    	etmpl.shedule = shdate.addDays(i);
		    	etmpl.to = shPat.email;
		    	const newEmail = new Email(etmpl);
		    	await newEmail.save();
		    	shPat.emails.push(newEmail._id);
		    }
		    await shPat.save();
	    }
	    console.log("Data saved to Db");
	    // return;
	    process.exit();
	  } catch(e) {
	    console.log("Some problems with database");
	    console.log(e);
	    process.exit();
	  }
}

async function cmpData(input){
	let errorsArr = [];
	const dbPatients = await Patient.find();
	for (let ipat of input){
		const imid = ipat['Member ID'];
		const dbpat = dbPatients.filter(el => el.mid === imid)[0];
		const dbpat2 = dbpat.toObject({ virtuals: true });
		for (const property in ipat) {
		  if(ipat[property] != dbpat2[property]){
		  	console.log(`There is difference in ${property} of user ${imid}`);
		  	let error = {'Patient ID': imid, Error: `There is difference in ${property}`};
		  	errorsArr.push(error);
		  }
		}
	}
	const fnameCmp =  dbPatients.filter(el => el.fname === '');
	if (fnameCmp.length > 0) {
		for (let fpat of fnameCmp){
			console.log(`Patient Id ${fpat.mid} missing first name`);
			let error = {'Patient ID': fpat.mid, Error: 'missing first name'};
		  	errorsArr.push(error);
		}
	}
	let emailCmp = dbPatients.filter(el => el.email === '').filter(el => el.con == 'Y');
	if (emailCmp.length > 0) {
		for (let fpat of emailCmp){
			console.log(`Patient Id ${fpat.mid} Email address is missing but consent is Y`);
			let error = {'Patient ID': fpat.mid, Error: 'Email address is missing but consent is Y'};
		  	errorsArr.push(error);

		}
	}
	const emailPatients = dbPatients.filter(el => el.con == 'Y');
	if (emailPatients.length > 0) {
		for (let fpat of emailPatients){
			if(!fpat.emails.length > 0){
				console.log(`Patient Id ${fpat.mid} Emails were not created`);
				let error = {'Patient ID': fpat.mid, Error: 'Emails were not created'};
		  		errorsArr.push(error);
			}
			if(fpat.email.length < 4){
				console.log(`Patient Id ${fpat.mid} Emails schedule not correct`);
				let error = {'Patient ID': fpat.mid, Error: 'Emails schedule not correct'};
		  		errorsArr.push(error);
			}
		}
	}
	const stringifyPromise = util.promisify(stringify);
	const data = await stringifyPromise(errorsArr,{ header: true, columns: ['Patient ID', 'Error']});
	fs.writeFile('errorReport.csv', data, (err) => {
	  if (err) throw err;
	  console.log('The file has been saved!');
	  process.exit();
	})

	// console.log(data);
	
}

async function readInput(filename){
	return new Promise((resolve,reject) => {
		let lnum = 0, curField,headerStr = '';
		let resultArr = [], headersArr = [];

		const rl = readline.createInterface({
		  input: fs.createReadStream(filename),
		  crlfDelay: Infinity
		});

		rl.on('line', (line) => {
			lnum++;
			if(lnum > 3){
				if (lnum % 2 !== 0) {
					let input = curField + ' ' + line;
					const records = parse(input, {
						columns: headersArr,
						delimiter: '|'
					})
					resultArr.push(records[0]);
				} else {
					curField = line;
				}
			} else {
				headerStr = headerStr + ' ' + line;
				if(lnum === 3){
					let pSym = '|';
					headerStr = headerStr.replace(new RegExp('[' + pSym + ']', 'g'), ',').trim();
					headersArr = headerStr.split(',')
					// console.log(headersArr);
				}
			}
		})

		rl.on('close', () => {
		  // console.log(resultArr)
		  resolve(resultArr);
		});
	})
}

async function startShow(){
	try{
		await connectDB();
		if(process.argv[3]){
			if(process.argv[2] != '-load' && process.argv[2] != '-test'){
				console.log("Please specify -load or -test key");
				process.exit();
			}
			const input = await readInput(process.argv[3]);
			if(process.argv[2] == '-load')
				await loadDataToDb(input);
			if(process.argv[2] == '-test')
				await cmpData(input);
			
		} else {
			console.log("Please use node index -load or -test FILENAME")
			process.exit();
		}
	} catch (e){
		console.log("MAIN MODULE ERROR")
		console.log(e)
	}
}

startShow();