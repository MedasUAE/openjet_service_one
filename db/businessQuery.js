
	function queryGetMedicineList(){
            const columns = [
                'ms.medicine_id',
                'ms.medicine_form',
	            'ms.medicine_dosage_unit',
                'ms.medicine_dosage_value',
                'cm.medicine_roa',
               'cm.medicine_qty',
               'cm.medicine_freq',
               'cm.medicine_freqtype',
               'cm.medicine_duration',
               'cm.remarks'
            ];
            return 'select distinct ' + columns.join(',') + ' FROM medicine_setup ms,consult_medicine cm' +
                ' where cm.medicine_id = ms.medicine_id' +
                ' AND cm.consult_id = ?' +
                 ' AND ms.control_medicine = ?';
               
        }

        function queryGetDiagnosisList(){
            const columns = [
                'icd_codes.icd_code as diagnosis_id',
                'consult_diagnosis.diagnosis_category',
	            'consult_diagnosis.consult_id'
            ];
            return 'select distinct ' + columns.join(',') + ' FROM icd_codes,user_setup,consult_diagnosis' +
            ' LEFT OUTER JOIN' +
    ' diagnosis_indicator_setup ON consult_diagnosis.indicator_id = diagnosis_indicator_setup.id' +
                ' where consult_diagnosis.diagnosis_id = icd_codes.icd_code' +
                ' AND consult_diagnosis.entered_by = user_setup.user_id'+
                 ' AND consult_diagnosis.consult_id = ?'+
                 ' AND consult_diagnosis.type = ?' +
                 ' ORDER BY  consult_diagnosis.consult_id';
                
        }

        function queryGetConsultationDetailsByConsultId(){
            const columns = [
                'new_registration.op_number',
                'new_registration.patient_name',
                'new_registration.date_of_birth',
                'new_registration.sex',
                'new_registration.mobile_code',
                'new_registration.mobile',
                'new_registration.emirates_id',
                'doctors_setup.doctors_name',
                'doctors_office.clinician_code',
               
            ];
            return 'select distinct ' + columns.join(',') + ' FROM  doctors_setup,doctors_office,new_registration,doctor_consult' +
            ' LEFT OUTER JOIN' +
    ' tpa_insurar ON doctor_consult.insurar_id = tpa_insurar.insurar_id'+
        ' AND tpa_insurar.insurar_sub = doctor_consult.insurar_sub' +

        ' LEFT OUTER JOIN' +
        '  eprescription ON eprescription.consult_id = doctor_consult.consult_id'+
            ' AND eprescription.cancel_status = ? ' +



                ' where  doctor_consult.op_number = new_registration.op_number' +
                '  AND doctor_consult.doctors_id = doctors_office.doctors_id'+
                 ' AND doctors_office.doctors_id = doctors_setup.doctors_id'+
                 '  AND doctor_consult.consult_id  = ?';
                 
        }

        function queryOfficeLetterHead(){
            const columns = [
                'office_details.office_id',
                'office_Name',
                'facility_id'
            ];
            return 'select distinct ' + columns.join(',') + ' FROM  office_details' +
            ' LEFT OUTER JOIN' +
    ' office_license_details ON office_license_details.office_id = office_details.office_Id'+
        ' AND office_license_details.active_status = ?' +
                ' where   office_details.office_Id = ?' +
                 '  AND office_details.active_Status = ?';
                 
        }
        
    exports.queryGetMedicineList = queryGetMedicineList;
    exports.queryGetDiagnosisList = queryGetDiagnosisList;
    exports.queryGetConsultationDetailsByConsultId = queryGetConsultationDetailsByConsultId;
    exports.queryOfficeLetterHead = queryOfficeLetterHead;
