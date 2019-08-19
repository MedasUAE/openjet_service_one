const db_query = require('../db/executeQuery');
const business_query = require('../db/businessQuery');
const axios = require('axios');
const moment = require('moment');


async function fetchAndValidate(reqBody,next){
    
       medicineList= await getAllConsultMedicine(reqBody.consult_id);
       medicines= await parseMedicine(medicineList);

       diagnosisList= await getAllConsultDiagnosis(reqBody.consult_id);
       consultationDetail = await getConsultationDetailsByConsultId(reqBody.consult_id);
       officeDetail = await getOfficeLetterHead(reqBody.office_id);
   
        validateData(medicines,diagnosisList,consultationDetail,officeDetail,(message)=>{
          //console.log("message:"+message);
          next(null,message);
        });
       
}

function getAllConsultMedicine(consult_id){
     const  query = business_query.queryGetMedicineList();
   const params = [consult_id,'Y'];
    return new Promise((resolve,reject)=>{
        db_query.paramQuery(query,params,(err,result)=>{
              if(err) return reject(err.sqlMessage);
            return resolve(result);
        })
    });
 }

 function getAllConsultDiagnosis(consult_id){
 const  query = business_query.queryGetDiagnosisList();
 const params = [consult_id,'F'];
  return new Promise((resolve,reject)=>{
      db_query.paramQuery(query,params,(err,result)=>{
            if(err) return reject(err.sqlMessage);
          return resolve(result);
      })
  });
}

function getConsultationDetailsByConsultId(consult_id){
  const  query = business_query.queryGetConsultationDetailsByConsultId();
  const params = ['N',consult_id];
   return new Promise((resolve,reject)=>{
       db_query.paramQuery(query,params,(err,result)=>{
             if(err) return reject(err.sqlMessage);
           return resolve(result);
       })
   });
 }

 function getOfficeLetterHead(office_id){
  const  query = business_query.queryOfficeLetterHead();
  const params = ['Y',office_id,'Y'];
   return new Promise((resolve,reject)=>{
       db_query.paramQuery(query,params,(err,result)=>{
             if(err) return reject(err.sqlMessage);
           return resolve(result);
       })
   });
 }
  function parseMedicine(medicineList){
   let medicines =[];
    medicineList.map( function(medicine) {
       medicine.medicine_qty = parseInt(medicine.medicine_qty);
       medicine.medicine_freq = parseInt(medicine.medicine_freq);
       medicine.medicine_dosage_value = parseInt(medicine.medicine_dosage_value);
       medicines.push(medicine);
 })
     
  return medicines;
 }

  function validateData(medicineList,diagnosisList,consultationDetail,officeDetail,next){
  
   let officeInfo = {};
   let patientInfo = {};
   let doctorInfo = {};
   if(officeDetail.length > 0){
   if(officeDetail[0].office_Name)  officeInfo.office_Name = officeDetail[0].office_Name;
   else  return  next("office name required");

   if(officeDetail[0].facility_id)  officeInfo.facility_id = officeDetail[0].facility_id;
   else  return   next("facility_id required");
   } else return   next("office Detail required");

   if(consultationDetail.length > 0){
   if(consultationDetail[0].emirates_id)  patientInfo.emirates_id = consultationDetail[0].emirates_id;
   else  return   next("emirates_id required");

   if(consultationDetail[0].date_of_birth)  patientInfo.date_of_birth = moment(consultationDetail[0].date_of_birth,"YYYY-MM-DD").format("YYYY-MM-DD");
   else  return   next("date_of_birth required");

   if(consultationDetail[0].sex)  patientInfo.sex = consultationDetail[0].sex;
   else  return   next("Gender required");
   if(consultationDetail[0].patient_name)  patientInfo.patient_name = consultationDetail[0].patient_name;
   else  return   next("patient_name required");
   if(consultationDetail[0].mobile)  patientInfo.mobile = consultationDetail[0].mobile_code + consultationDetail[0].mobile;
   else  return   next("mobile required");
   
   if(consultationDetail[0].clinician_code)  doctorInfo.clinician_code = consultationDetail[0].clinician_code;
   else  return   next("clinician_code required");
   if(consultationDetail[0].doctors_name)  doctorInfo.doctors_name = consultationDetail[0].doctors_name;
   else  return   next("doctors_name required");
  } else return   next("Consultation Detail required");

   if(diagnosisList.length == 0)  return next("Plz add atleast one diagnosis");
   
   if(medicineList.length == 0)  return next("Plz add at least one control medicine");
  
   
//  api call 
  postApiCall({medicineList,diagnosisList,doctorInfo,patientInfo,officeInfo},(message)=>{
    return next(message);
 });

 }

 function postApiCall(jsonData,next){
  //console.log("jsonData:"+JSON.stringify(jsonData))
  axios.post('https://openjet.herokuapp.com/medicinerequest', jsonData)
      .then((response) => {
        //console.log(response.data.message)
       return next(response.data.message);
      })
      .catch((error) => {
        //console.log(error)
        return next(error);
      });

 }

exports.fetchAndValidate = fetchAndValidate;
exports.getAllConsultMedicine = getAllConsultMedicine;
exports.getAllConsultDiagnosis = getAllConsultDiagnosis;
exports.getConsultationDetailsByConsultId = getConsultationDetailsByConsultId;
exports.getOfficeLetterHead = getOfficeLetterHead;

