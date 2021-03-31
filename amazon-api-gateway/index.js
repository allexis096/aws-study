const moment = require('moment')

const patients = [
    { id: 1, name: 'Maria', birthday: '1984-01-11' },    
    { id: 2, name: 'Joao', birthday: '1983-09-16' },    
    { id: 3, name: 'José', birthday: '1959-07-15' }
]

function showPatient(id) {
    return patients.find(patient => patient.id === id)
}

function calcAge(patient) {
    const today = moment()
    const birthday = moment(patient.birthday, 'YYYY-MM-DD')
    
    return today.diff(birthday, 'years')
}

exports.handler = async (event) => {
    console.log('patient:', event.patientId);
    
    let foundedPatient
    
    if (event.patientId) {
        foundedPatient = showPatient(event.patientId)
        foundedPatient.age = calcAge(foundedPatient)
        
        return {
            statusCode: 200,
            body: JSON.stringify(foundedPatient)
        }
    }
    console.log('deploy cli')
    const allPatients = patients.map(p => ({ ...p, age: calcAge(p) }) )
    
    return {
        statusCode: 200,
        body: JSON.stringify(allPatients)
    }
};
