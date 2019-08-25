const db_query = require('../db/executeQuery');
const business_query = require('../db/businessQuery');
const axios = require('axios');
const moment = require('moment');

//logging
const log4js = require('log4js');
log4js.configure({
  appenders: { businessLogic: { type: 'file', filename: './logs/businessLogic_ErrorLog.log' } },
  categories: { default: { appenders: ['businessLogic'], level: 'debug' } }
});
const logger = log4js.getLogger('businessLogic');


async function fetchAndValidate(reqBody, next) {

  medicineList = await getAllConsultMedicine(reqBody.consult_id);
  diagnosisList = await getAllConsultDiagnosis(reqBody.consult_id);
  consultationDetail = await getConsultationDetailsByConsultId(reqBody.consult_id);
  officeDetail = await getOfficeLetterHead(reqBody.office_id);
  validData = await validateData(medicineList, diagnosisList, consultationDetail, officeDetail);

  if (typeof validData == 'string') {
    logger.error(validData);
    next(null, validData);
  } else {
    apiCall(validData, (message) => {
        logger.info(' final message:', message);
        next(null, message);
    });
  }
}

function getAllConsultMedicine(consult_id) {
  const query = business_query.queryGetMedicineList();
  const params = [consult_id, 'Y'];
  return new Promise((resolve, reject) => {
    db_query.paramQuery(query, params, (err, result) => {
      if (err) {
        logger.error("getAllConsultMedicine: "+err.sqlMessage);
        return reject(err.sqlMessage);
      }

      return resolve(result);
    })
  });
}

function getAllConsultDiagnosis(consult_id) {
  const query = business_query.queryGetDiagnosisList();
  const params = [consult_id, 'F'];
  return new Promise((resolve, reject) => {
    db_query.paramQuery(query, params, (err, result) => {
      if (err) {
        logger.error("getAllConsultDiagnosis: "+err.sqlMessage);
        return reject(err.sqlMessage);
      }
      return resolve(result);
    })
  });
}

function getConsultationDetailsByConsultId(consult_id) {
  const query = business_query.queryGetConsultationDetailsByConsultId();
  const params = ['N', consult_id];
  return new Promise((resolve, reject) => {
    db_query.paramQuery(query, params, (err, result) => {
      if (err) {
        logger.error("getConsultationDetailsByConsultId: "+err.sqlMessage);
        return reject(err.sqlMessage);
      }
      return resolve(result);
    })
  });
}

function getOfficeLetterHead(office_id) {
  const query = business_query.queryOfficeLetterHead();
  const params = ['Y', office_id, 'Y'];
  return new Promise((resolve, reject) => {
    db_query.paramQuery(query, params, (err, result) => {
      if (err) {
        logger.error("getOfficeLetterHead: "+err.sqlMessage);
        return reject(err.sqlMessage);
      }
      return resolve(result);
    })
  });
}


function validateMedicines(medicineList) {
  let returnObj = {
    valid: true,
    message: "",
    medicineList: []
  }

  if (medicineList.length == 0) {
    returnObj.valid = false;
    returnObj.message = "Plz add at least one control medicine";
    return returnObj;

  } else {

    medicineList.map(function (medicine) {

      if (medicine.medicine_id) medicine.medicine_id = medicine.medicine_id;
      else {
        returnObj.valid = false;
        returnObj.message = "medicine_id required";
        return returnObj;
      }

      if (medicine.medicine_dosage_unit) medicine.medicine_dosage_unit = medicine.medicine_dosage_unit;
      else {
        returnObj.valid = false;
        returnObj.message = "medicine_dosage_unit required";
        return returnObj;
      }
      if (medicine.medicine_dosage_value) medicine.medicine_dosage_value = parseInt(medicine.medicine_dosage_value);
      else {
        returnObj.valid = false;
        returnObj.message = "medicine_dosage_value required";
        return returnObj;
      }
      if (medicine.medicine_roa) medicine.medicine_roa = medicine.medicine_roa;
      else {
        returnObj.valid = false;
        returnObj.message = "medicine_roa required";
        return returnObj;
      }
      if (medicine.medicine_qty) medicine.medicine_qty = parseInt(medicine.medicine_qty);
      else {
        returnObj.valid = false;
        returnObj.message = "medicine_qty required";
        return returnObj;
      }

      if (medicine.medicine_freq) medicine.medicine_freq = parseInt(medicine.medicine_freq);
      else {
        returnObj.valid = false;
        returnObj.message = "medicine_freq required";
        return returnObj;
      }

      if (medicine.medicine_freqtype) medicine.medicine_freqtype = medicine.medicine_freqtype;
      else {
        returnObj.valid = false;
        returnObj.message = "medicine_freqtype required";
        return returnObj;
      }
      if (medicine.medicine_duration) medicine.medicine_duration = medicine.medicine_duration;
      else {
        returnObj.valid = false;
        returnObj.message = "medicine_duration required";
        return returnObj;
      }
      if (medicine.remarks) medicine.remarks = medicine.remarks;
      else {
        returnObj.valid = false;
        returnObj.message = "remarks required";
        return returnObj;
      }
      returnObj.medicineList.push(medicine);
    })
    return returnObj;
  }

}

function validateOfficeDetail(officeDetail) {
  let returnObj = {
    valid: true,
    message: "",
    officeInfo: {}
  }
  if (officeDetail.length > 0) {
    if (officeDetail[0].office_Name) returnObj.officeInfo.office_Name = officeDetail[0].office_Name;
    else {
      returnObj.valid = false;
      returnObj.message = "office_Name required";
      return returnObj;
    }

    if (officeDetail[0].facility_id) returnObj.officeInfo.facility_id = officeDetail[0].facility_id;
    else {
      returnObj.valid = false;
      returnObj.message = "facility_id required";
      return returnObj
    }
  }
  else {
    returnObj.valid = false;
    returnObj.message = "office Detail required";
    return returnObj;
  }
  return returnObj;
}

function validateConsultationDetail(consultationDetail) {
  let returnObj = {
    valid: true,
    message: "",
    patientInfo: {}
  }
  if (consultationDetail.length > 0) {
    if (consultationDetail[0].emirates_id) returnObj.patientInfo.emirates_id = consultationDetail[0].emirates_id;
    else {
      returnObj.valid = false;
      returnObj.message = "emirates_id required";
      return returnObj;
    }

    if (consultationDetail[0].date_of_birth) returnObj.patientInfo.date_of_birth = moment(consultationDetail[0].date_of_birth, "YYYY-MM-DD").format("YYYY-MM-DD");
    else {
      returnObj.valid = false;
      returnObj.message = "date_of_birth required";
      return returnObj
    }

    if (consultationDetail[0].sex) returnObj.patientInfo.sex = consultationDetail[0].sex;
    else {
      returnObj.valid = false;
      returnObj.message = "Gender required";
      return returnObj
    }
    if (consultationDetail[0].patient_name) returnObj.patientInfo.patient_name = consultationDetail[0].patient_name; else {
      returnObj.valid = false;
      returnObj.message = "patient_name required";
      return returnObj
    }
    if (consultationDetail[0].mobile) returnObj.patientInfo.mobile = consultationDetail[0].mobile_code + consultationDetail[0].mobile; else {
      returnObj.valid = false;
      returnObj.message = "mobile required";
      return returnObj
    }
  }
  else {
    returnObj.valid = false;
    returnObj.message = "Consultation Detail required";
    return returnObj;
  }
  return returnObj;
}

function validateDoctorInfo(consultationDetail) {
  let returnObj = {
    valid: true,
    message: "",
    doctorInfo: {}
  }
  if (consultationDetail.length > 0) {
    if (consultationDetail[0].clinician_code) returnObj.doctorInfo.clinician_code = consultationDetail[0].clinician_code;
    else {
      returnObj.valid = false;
      returnObj.message = "clinician_code required";
      return returnObj
    }
    if (consultationDetail[0].doctors_name) returnObj.doctorInfo.doctors_name = consultationDetail[0].doctors_name;
    else {
      returnObj.valid = false;
      returnObj.message = "doctors_name required";
      return returnObj
    }
  }
  else {
    returnObj.valid = false;
    returnObj.message = "Doctor Detail required";
    return returnObj;
  }
  return returnObj;
}

function validateDiagnosis(diagnosisList) {
  let diagnosisObj = {}
  let returnObj = {
    valid: true,
    message: "",
    diagnosisList: []
  }
  if (diagnosisList.length > 0) {
    diagnosisList.map(function (diagnosis) {
      if (diagnosis.diagnosis_id) diagnosisObj.diagnosis_id = diagnosis.diagnosis_id;
      else {
        returnObj.valid = false;
        returnObj.message = "diagnosis_id required";
        return returnObj;
      }
      if (diagnosis.diagnosis_category) diagnosisObj.diagnosis_category = diagnosis.diagnosis_category;
      else {
        returnObj.valid = false;
        returnObj.message = "diagnosis_category required";
        return returnObj
      }
      returnObj.diagnosisList.push(diagnosisObj)
    })
  }
  else {
    returnObj.valid = false;
    returnObj.message = "Diagnosis Detail required";
    return returnObj;
  }
  return returnObj;
}

async function validateData(medicineList, diagnosisList, consultationDetail, officeDetail) {

  let officeObj = await validateOfficeDetail(officeDetail);
  if (!officeObj.valid) {
    logger.error("validateOfficeDetail: "+ officeObj.message);
    return officeObj.message;
  }

  let patientObj = await validateConsultationDetail(consultationDetail);
  if (!patientObj.valid) {
    logger.error("validateConsultationDetail:"+ patientObj.message);
    return patientObj.message;

  }

  let doctorObj = await validateDoctorInfo(consultationDetail);
  if (!doctorObj.valid) {
    logger.error("validateDoctorInfo:"+ doctorObj.message);
    return doctorObj.message;
  }

  let medicineObj = await validateMedicines(medicineList);
  if (!medicineObj.valid) {
    logger.error("validateMedicines: "+medicineObj.message);
    return medicineObj.message;
  }
  let diagnosisObj = await validateDiagnosis(diagnosisList);
  if (!diagnosisObj.valid) {
    logger.error("validateDiagnosis: "+diagnosisObj.message);
    return diagnosisObj.message;
  }
  return {
    "officeInfo": officeObj.officeInfo, "patientInfo": patientObj.patientInfo,
    "doctorInfo": doctorObj.doctorInfo, "medicineList": medicineObj.medicineList, "diagnosisList": diagnosisObj.diagnosisList
  };
}
function apiCall(jsonData, next) {
  axios.post('https://openjet.herokuapp.com/medicinerequest', jsonData)
    .then((response) => {
      return next(response.data.message);
    })
    .catch((error) => {
      logger.error("apiCall: "+error.message);
      return next(error.message);
    });
}

exports.fetchAndValidate = fetchAndValidate;
exports.getAllConsultMedicine = getAllConsultMedicine;
exports.getAllConsultDiagnosis = getAllConsultDiagnosis;
exports.getConsultationDetailsByConsultId = getConsultationDetailsByConsultId;
exports.getOfficeLetterHead = getOfficeLetterHead;



