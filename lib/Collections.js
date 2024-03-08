
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';


import moment from 'moment';
import { get } from 'lodash';

// import { FhirUtilities, AllergyIntolerances, Conditions, CarePlans, Encounters, Immunizations, MedicationStatements, Observations, Patients, Procedures } from 'meteor/clinical:hl7-fhir-data-infrastructure';
import { FhirUtilities, AllergyIntolerances, CarePlans, Conditions, Consents, Contracts, ClinicalImpressions, Communications, Composition, Devices, DiagnosticReports, DocumentReferences, DocumentManifests, Encounters, Goals, Immunizations, ImagingStudies, Locations, Measures, MeasureReports, Medications, MedicationOrders, MedicationStatements, Organizations, Observations, Patients, Practitioners, Persons, Procedures, Questionnaires, QuestionnaireResponses, RiskAssessments, RelatedPersons, Sequences} from 'meteor/clinical:hl7-fhir-data-infrastructure';


if(Meteor.isClient){
  ImportCursor = new Mongo.Collection('ImportCursor', {connection: null});
  ExportCursor = new Mongo.Collection('ExportCursor', {connection: null});
  HealthKitImport = new Mongo.Collection('HealthKitImport', {connection: null});
}


