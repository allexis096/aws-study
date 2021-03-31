'use strict';

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodbOfflineOptions = {
  region: 'localhost',
  endpoint: 'http://localhost:8000'
}

const isOffline = true;

const dynamoDb = isOffline
  ? new AWS.DynamoDB.DocumentClient(dynamodbOfflineOptions)
  : new AWS.DynamoDB.DocumentClient();

const params = {
  TableName: 'PATIENTS',
}

module.exports.listPatients = async () => {
  try {
    const data = await dynamoDb.scan(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(data.Items),
    }
  } catch (err) {
    console.log({ err });
    return {
      statusCode: err.statusCode || 500,
      body: JSON.stringify({
        error: err.name || 'Exception',
        message: err.message || 'Unknown error',
      })
    }
  }
};

module.exports.showPatient = async (event) => {
  try {
    const { patientId } = event.pathParameters;

    const data = await dynamoDb.get({
      ...params,
      Key: {
        patient_id: patientId,
      }
    }).promise();

    if (!data.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Patient not found' }),
      }
    }

    const patient = data.Item;

    return {
      statusCode: 200,
      body: JSON.stringify(patient),
    }
  } catch (err) {
    console.log({ err });
    return {
      statusCode: err.statusCode || 500,
      body: JSON.stringify({
        error: err.name || 'Exception',
        message: err.message || 'Unknown error',
      }),
    }
  }
};

module.exports.createPatient = async (event) => {
  try {
    const data = JSON.parse(event.body);
    const timestamp = new Date().getTime();
    const { name_person, birthday, email, phone } = data;
    const patient = {
      patient_id: uuidv4(),
      name_person,
      birthday,
      email,
      phone,
      status: true,
      created_at: timestamp,
      updated_at: timestamp,
    };
  
    await dynamoDb.put({ TableName: 'PATIENTS', Item: patient }).promise()
  
    return {
      statusCode: 201,
      body: JSON.stringify(patient)
    }
  } catch (err) {
    console.log({ err });
    return {
      statusCode: err.statusCode || 500,
      body: JSON.stringify({
        error: err.name || 'Exception',
        message: err.message || 'Unknown error',
      }),
    }
  }
};

module.exports.updatePatient = async (event) => {
  const { patientId } = event.pathParameters;

  try {
    const timestamp = new Date().getTime();
    const data = JSON.parse(event.body);
    const { name_person, birthday, email, phone } = data;
  
    await dynamoDb.update({
      ...params,
      Key: {
        patient_id: patientId
      },
      UpdateExpression:
        'SET name_person = :name_person, birthday = :bd, email = :email,'
        + ' phone = :phone, updated_at = :updated_at',
      ConditionExpression: 'attribute_exists(patient_id)',
      ExpressionAttributeValues: {
        ':name_person': name_person,
        ':bd': birthday,
        ':email': email,
        ':phone': phone,
        ':updated_at': timestamp,
      }
    }).promise();
  
    return {
      statusCode: 204,
    }
  } catch (err) {
    console.log({ err });

    let errorType = {
      statusCode: err.statusCode || 500,
      error: err.name || 'Exception',
      message: err.message || 'Unknown error',
    }

    if (errorType.error === 'ConditionalCheckFailedException') {
      errorType.error = 'Patient not exists';
      errorType.message = `ID ${patientId} not exists`;
      errorType.statusCode = 404;
    }

    return {
      statusCode: errorType.statusCode,
      body: JSON.stringify({
        error: errorType.error,
        message: errorType.message
      }),
    }
  }
};

module.exports.deletePatient = async (event) => {
  const { patientId } = event.pathParameters;

  try {
    await dynamoDb.delete({
      ...params,
      Key: {
        patient_id: patientId,
      },
      ConditionExpression: 'attribute_exists(patient_id)'
    }).promise();

    return {
      statusCode: 204,
    }
  } catch (err) {
    console.log({ err });

    let errorType = {
      statusCode: err.statusCode || 500,
      error: err.name || 'Exception',
      message: err.message || 'Unknown error',
    }

    if (errorType.error === 'ConditionalCheckFailedException') {
      errorType.error = 'Patient not exists';
      errorType.message = `ID ${patientId} not exists`;
      errorType.statusCode = 404;
    }

    return {
      statusCode: errorType.statusCode,
      body: JSON.stringify({
        error: errorType.error,
        message: errorType.message
      }),
    }
  }
};