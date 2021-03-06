// https://www.npmjs.com/package/react-dropzone-component
// http://www.dropzonejs.com/

import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';

import { FhirUtilities } from 'meteor/clinical:hl7-fhir-data-infrastructure';

import { 
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@material-ui/core';

import { Session } from 'meteor/session';
import { Meteor } from 'meteor/meteor';

import { Icon } from 'react-icons-kit'
import {ic_share} from 'react-icons-kit/md/ic_share'
import {ic_link} from 'react-icons-kit/md/ic_link'
import {ic_wifi_tethering} from 'react-icons-kit/md/ic_wifi_tethering'

import { get } from 'lodash';

let supportedResources = [
  "AllergyIntolerance",
  "Appointment",
  "Bundle",
  "CarePlan",
  "CareTeam",
  "Claim",
  "CodeSystem",
  "Condition",
  "Consent",
  "Contract",
  "Communication",
  "CommunicationRequest",
  "CommunicationResponse",
  "ClinicalImpression",
  "ClinicalDocument",
  "Device",
  "DiagnosticReport",
  "DocumentReference",
  "Endpoint",
  "Encounter",
  "ExplanationOfBenefit",
  "FamilyMemberHistory",
  "Goal",
  "HealthcareService",
  "Immunization",
  "InsurancePlan",
  "ImagingStudy",
  "List",
  "Location",
  "Measure",
  "MeasureReport",
  "Medication",
  "MedicationOrder",
  "MedicationStatement",
  "MessageHeader",
  "Network",
  "Observation",
  "Organization",
  "OrganizationAffiliation",
  "Patient",
  "Person",
  "Practitioner",
  "PractitionerRole",
  "Procedure",
  "ProcedureRequest",
  "Provenance",
  "Questionnaire",
  "QuestionnaireResponse",
  "RelatedPerson",
  "Restriction",
  "RiskAssessment",
  "SearchParameter",
  "Schedule",
  "ServiceRequest",
  "Sequence",
  "StructureDefinition",
  "Task",
  "ValueSet",
  "VerificationResult"
]

let importToggles = {
  importsAll: true,
  zero: true
};
let exportToggles = {
  exportsAll: false,
  zero: true
};
let clientCounts = {
  zero: 0
}
let localClientCounts = {
  zero: 0
}
let datalakeCounts = {
  zero: 0
}
let pubsubToggles = {}

supportedResources.forEach(function(resourceType){
  importToggles[resourceType] = true;
  exportToggles[resourceType] = false;

  clientCounts[resourceType] = 0;
  localClientCounts[resourceType] = 0;
  datalakeCounts[resourceType] = 0;
  pubsubToggles[resourceType] = false;
})

Session.setDefault('toggleImportStates', importToggles);
Session.setDefault('toggleExportStates', exportToggles);


Session.setDefault('datalakeStats', false);
Meteor.call('getServerStats', function(error, result){
  if(result){
    Session.set('datalakeStats', result);
  }
});

export function CollectionManagement(props){

  let { 
    displayIcons,
    displayImportCheckmarks,
    displayExportCheckmarks,
    displayPubSubEnabled,
    displayClientCount,
    displayLocalClientCount,
    displayServerCount,
    displayInit,
    displayDrop,
    displaySync,
    displayImportButton,
    displayExportButton,
    displayDropButton,
    displayPreview,
    selectedPatientId,
    resourceTypes,
    mode,
    exportFileType,
    noDataMessage,
    preview,
    tableSize,
    onSelectionChange,
    onSelectedExportChange,
    ...otherProps 
  } = props;


  let data = {
    user: {
      isAdmin: false
    },
    collections: {
      checkedImports: importToggles,  
      checkedExports: exportToggles,
      preview: {},
      client: clientCounts,
      localClient: localClientCounts,
      datalake: datalakeCounts,
      pubsub: pubsubToggles
    }
  };

  data.collections.checkedImports = useTracker(function(){
    return Session.get('toggleImportStates');
  }, [])
  data.collections.checkedExports = useTracker(function(){
    return Session.get('toggleExportStates');
  }, [])
  data.collections.datalake = useTracker(function(){
    return Session.get('datalakeStats');
  }, [])

  if(props.preview){
    Object.keys(props.preview).forEach(function(key){
      data.collections.preview[key] = props.preview[key];
    })

    logger.debug('CollectionManagement.data.collections.preview', data.collections.preview)
  }

  //------------------------------------------------------------
  // TODO: Refactor using the following

  let collectionManagementQuery = {};

  if(props.selectedPatientId){
    collectionManagementQuery["subject.reference"] = "urn:uuid:" + props.selectedPatientId
  }
  supportedResources.forEach(function(resourceName){
    if(typeof window[FhirUtilities.pluralizeResourceName(resourceName)] === "object"){
      data.collections.client[resourceName] = window[FhirUtilities.pluralizeResourceName(resourceName)].find(collectionManagementQuery).count();
      data.collections.localClient[resourceName] = window[FhirUtilities.pluralizeResourceName(resourceName)]._collection.find(collectionManagementQuery).count();

      if(Meteor.default_connection){
        Object.keys( Meteor.default_connection._subscriptions).forEach(function(key) {
          if(Meteor.default_connection._subscriptions[key]){
            var record = Meteor.default_connection._subscriptions[key];          
            if(record.name === FhirUtilities.pluralizeResourceName(resourceName)){
              data.collections.pubsub[resourceName] = true;
            }  
          }
        });
      }
    }
  });

  // console.log('ImportPage.CollectionManagement.data', data)

  // let user = Meteor.user();
  // if (user && user.roles) {
  //   user.roles.forEach(function(role){
  //     if (role === "sysadmin") {
  //       data.user.isAdmin = true;
  //     } else if (role === "practitioner") {
  //       data.user.isPractitioner = true;
  //     } else if (role === "patient") {
  //       data.user.isPatient = true;
  //     }
  //   });
  // }

  logger.trace('CollectionManagement.data', data)

  function setToggleImportState(resourceName, isInputChecked){
    let toggleStates = Session.get('toggleImportStates');
    toggleStates[resourceName] = isInputChecked;
    Session.set('toggleImportStates', toggleStates);
  }
  function setToggleExportState(collection, isInputChecked){
    let toggleExportStates = Session.get('toggleExportStates');
    toggleExportStates[collection] = isInputChecked;
    console.log('toggleExportStates', toggleExportStates)
    Session.set('toggleExportStates', toggleExportStates);
  }
  function toggleAllImports(event, isInputChecked){
    console.log('toggleAllImports', isInputChecked, get(data, 'collections.checkedImports.importsAll'));

    setToggleImportState('importsAll', isInputChecked);

    supportedResources.forEach(function(resourceName){
      setToggleImportState(resourceName, isInputChecked)
    });
  }
  
  var methods = {};
  supportedResources.forEach(function(resourceType){
    methods["toggle" + pluralizeResourceName(resourceType)] = function(event, isInputChecked){
      console.log('event', event.currentTarget.value)
      console.log('isInputChecked', isInputChecked)
      setToggleImportState(resourceType, isInputChecked)
      if(typeof onSelectionChange === "function"){
        console.log('onSelectionChange')
        onSelectionChange(Session.get('toggleImportStates'))
      }
    }
  })

  console.log('methods', methods);


  function toggleAllExports(isInputChecked, event, ){
    console.log('toggleAllExports', isInputChecked, get(this, 'data.collections.checkedExports.exportsAll'));

    setToggleExportState('exportsAll', isInputChecked)

    supportedResources.forEach(function(resourceName){
      setToggleExportState(resourceName, isInputChecked)
    });
  }

  var exportMethods = {};
  supportedResources.forEach(function(collectionName){
    exportMethods["toggle" + pluralizeResourceName(collectionName) + "Export"] = function(event, isInputChecked){
      setToggleExportState(collectionName, isInputChecked)
      if(typeof onSelectedExportChange === "function"){
        console.log('onSelectedExportChange')
        onSelectedExportChange(Session.get('toggleExportStates'))
      }
    }
  })
  // function toggleAllergiesExport(event, isInputChecked){    
  //   setToggleExportState('AllergyIntolerance', isInputChecked)
  // };
  // function toggleAppointmentsExport(event, isInputChecked){    
  //   setToggleExportState('Appointment', isInputChecked)
  // };
  // function toggleBundlesExport(event, isInputChecked){    
  //   setToggleExportState('Bundle', isInputChecked)
  // };
  // function toggleCarePlansExport(event, isInputChecked){    
  //   setToggleExportState('CarePlan', isInputChecked)
  // };
  // function toggleCareTeamsExport(event, isInputChecked){    
  //   setToggleExportState('CareTeam', isInputChecked)
  // };
  // function toggleClaimsExport(event, isInputChecked){    
  //   setToggleExportState('Claim', isInputChecked)
  // };
  // function toggleClinicalDocumentsExport(event, isInputChecked){    
  //   setToggleExportState('ClinicalDocument', isInputChecked)
  // };
  // function toggleCodeSystemsExport(event, isInputChecked){    
  //   setToggleExportState('CodeSystem', isInputChecked)
  // };
  // function toggleConditionsExport(event, isInputChecked){    
  //   setToggleExportState('Condition', isInputChecked)
  // };
  // function toggleConsentsExport(event, isInputChecked){    
  //   setToggleExportState('Consent', isInputChecked)
  // };
  // function toggleContractsExport(event, isInputChecked){    
  //   setToggleExportState('Contract', isInputChecked)
  // };
  // function toggleCommunicationsExport(event, isInputChecked){    
  //   setToggleExportState('Communication', isInputChecked)
  // };
  // function toggleCommunicationResponsesExport(event, isInputChecked){    
  //   setToggleExportState('CommunicationResponse', isInputChecked)
  // };
  // function toggleCommunicationRequestsExport(event, isInputChecked){    
  //   setToggleExportState('CommunicationRequest', isInputChecked)
  // };
  // function toggleClinicalImpressionsExport(event, isInputChecked){    
  //   setToggleExportState('ClinicalImpression', isInputChecked)
  // };
  // function toggleDevicesExport(event, isInputChecked){    
  //   setToggleExportState('Device', isInputChecked)
  // };
  // function toggleDiagnosticReportsExport(event, isInputChecked){    
  //   setToggleExportState('DiagnosticReport', isInputChecked)
  // };
  //   function toggleDocumentReferencesExport(event, isInputChecked){    
  //   setToggleExportState('DocumentReference', isInputChecked)
  // };
  // function toggleEncountersExport(event, isInputChecked){    
  //   setToggleExportState('Encounter', isInputChecked)
  // };
  // function toggleEndpointsExport(event, isInputChecked){    
  //   setToggleExportState('Endpoint', isInputChecked)
  // };
  // function toggleExplanationOfBenefitsExport(event, isInputChecked){    
  //   setToggleExportState('ExplanationOfBenefit', isInputChecked)
  // };
  // function toggleFamilyMemberHistoriesExport(event, isInputChecked){    
  //   setToggleExportState('FamilyMemberHistory', isInputChecked)
  // };
  // function toggleGoalsExport(event, isInputChecked){
  //   setToggleExportState('Goal', isInputChecked)
  // };
  // function toggleHealthcareServicesExport(event, isInputChecked){
  //   setToggleExportState('HealthcareService', isInputChecked)
  // };
  // function toggleImmunizationsExport(event, isInputChecked){
  //   setToggleExportState('Immunization', isInputChecked)
  // };
  // function toggleInsurancePlansExport(event, isInputChecked){
  //   setToggleExportState('InsurancePlan', isInputChecked)
  // };
  // function toggleImagingStudiesExport(event, isInputChecked){    
  //   setToggleExportState('ImagingStudy', isInputChecked)
  // };
  // function toggleListsExport(event, isInputChecked){
  //   setToggleExportState('List', isInputChecked)
  // };
  // function toggleLocationsExport(event, isInputChecked){
  //   setToggleExportState('Location', isInputChecked)
  // };
  // function toggleMeasuresExport(event, isInputChecked){    
  //   setToggleExportState('Measure', isInputChecked)
  // };
  // function toggleMeasureReportsExport(event, isInputChecked){    
  //   setToggleExportState('MeasureReport', isInputChecked)
  // };
  // function toggleMedicationsExport(event, isInputChecked){    
  //   setToggleExportState('Medication', isInputChecked)
  // };
  // function toggleMedicationOrdersExport(event, isInputChecked){
  //   setToggleExportState('MedicationOrder', isInputChecked)
  // }
  // function toggleMedicationStatementsExport(event, isInputChecked){
  //   setToggleExportState('MedicationStatement', isInputChecked)
  // }
  // function toggleMessageHeadersExport(event, isInputChecked){    
  //   setToggleExportState('MessageHeader', isInputChecked)
  // };
  // function toggleNetworksExport(event, isInputChecked){    
  //   setToggleExportState('Network', isInputChecked)
  // };
  // function toggleObservationsExport(event, isInputChecked){    
  //   setToggleExportState('Observation', isInputChecked)
  // };
  // function toggleOrganizationsExport(event, isInputChecked){    
  //   setToggleExportState('Organization', isInputChecked)
  // };
  // function toggleOrganizationAffiliationsExport(event, isInputChecked){    
  //   setToggleExportState('OrganizationAffiliation', isInputChecked)
  // };
  // function togglePatientsExport(event, isInputChecked){    
  //   setToggleExportState('Patient', isInputChecked)
  // };
  // function togglePersonsExport(event, isInputChecked){    
  //   setToggleExportState('Person', isInputChecked)
  // };
  // function togglePractitionersExport(event, isInputChecked){    
  //   setToggleExportState('Practitioner', isInputChecked)
  // };
  // function togglePractitionerRolesExport(event, isInputChecked){    
  //   setToggleExportState('PractitionerRole', isInputChecked)
  // };
  // function toggleProceduresExport(event, isInputChecked){    
  //   setToggleExportState('Procedure', isInputChecked)
  // };
  // function toggleProvenancesExport(event, isInputChecked){    
  //   setToggleExportState('Provenance', isInputChecked)
  // };
  // function toggleProcedureRequestsExport(event, isInputChecked){    
  //   setToggleExportState('ProcedureRequest', isInputChecked)
  // };
  // function toggleQuestionnairesExport(event, isInputChecked){    
  //   setToggleExportState('Questionnaire', isInputChecked)
  // };
  // function toggleQuestionnaireResponsesExport(event, isInputChecked){    
  //   setToggleExportState('QuestionnaireResponse', isInputChecked)
  // };
  // function toggleRelatedPersonsExport(event, isInputChecked){    
  //   setToggleExportState('RelatedPerson', isInputChecked)
  // };
  // function toggleRestrictionsExport(event, isInputChecked){    
  //   setToggleExportState('Restriction', isInputChecked)
  // };
  // function toggleRiskAssessmentsExport(event, isInputChecked){    
  //   setToggleExportState('RiskAssessment', isInputChecked)
  // };
  // function toggleSearchParametersExport(event, isInputChecked){    
  //   setToggleExportState('SearchParameters', isInputChecked)
  // };
  // function toggleSchedulesExport(event, isInputChecked){    
  //   setToggleExportState('Schedule', isInputChecked)
  // };
  // function toggleServiceRequestsExport(event, isInputChecked){    
  //   setToggleExportState('ServiceRequest', isInputChecked)
  // };
  // function toggleSequencesExport(event, isInputChecked){    
  //   setToggleExportState('Sequence', isInputChecked)
  // };
  // function toggleStructureDefinitionsExport(event, isInputChecked){    
  //   setToggleExportState('StructureDefinition', isInputChecked)
  // };
  // function toggleTasksExport(event, isInputChecked){    
  //   setToggleExportState('Task', isInputChecked)
  // };
  // function toggleValueSetsExport(event, isInputChecked){    
  //   setToggleExportState('ValueSet', isInputChecked)
  // };
  // function toggleVerificationResultsExport(event, isInputChecked){    
  //   setToggleExportState('VerificationResult', isInputChecked)
  // };

  //------------------------------------------------------------
  // TODO: Refactor using the following

  // toggleExportState(event, isInputChecked, resourceName){    
  //   setToggleExportState(resourceName, isInputChecked)
  // };

  function singularizeResourceName(resourceTypeString){
    var singularized = '';
    switch (resourceTypeString) {
      case 'Binaries':          
        singularized = 'Binary';
        break;
      case 'Libraries':      
        singularized = 'Library';
        break;
      case 'SupplyDeliveries':      
        singularized = 'SupplyDelivery';
        break;
      case 'ImagingStudies':      
        singularized = 'ImagingStudy';
        break;        
      case 'FamilyMemberHistories':      
        singularized = 'FamilyMemberHistory';
        break;        
      case 'ResearchStudies':      
        singularized = 'ResearchStudy';
        break;        
      default:
        singularized = resourceTypeString.substring(0, resourceTypeString.length - 1)
        break;
    }

    return singularized;
  }

  function pluralizeResourceName(resourceTypeString){
    var pluralized = '';
    switch (resourceTypeString) {
      case 'Binary':          
        pluralized = 'Binaries';
        break;
      case 'Library':      
        pluralized = 'Libraries';
        break;
      case 'SupplyDelivery':      
        pluralized = 'SupplyDeliveries';
        break;
      case 'ImagingStudy':      
        pluralized = 'ImagingStudies';
        break;        
      case 'FamilyMemberHistory':      
        pluralized = 'FamilyMemberHistories';
        break;        
      case 'ResearchStudy':      
        pluralized = 'ResearchStudies';
        break;        
      default:
        pluralized = resourceTypeString + 's';
        break;
    }

    return pluralized;
  }
  function exportCollection(collectionName, exportFileType){
    console.log("Exporting the ' + collectionName + ' collection.")
    console.log("Not Implemeted.")

    // let self = this;

    // let fileData;
    // let collectionExportFileExtension = get(Meteor, 'settings.public.defaults.exportFile.collectionExportFileExtension', 'json');

    // switch (collectionExportFileExtension) {
    //   case "csv":
    //     fileData = MedicalRecordsExporter.exportCsv(collectionName);
    //     break;    
    //   case "application/csv":
    //     fileData = MedicalRecordsExporter.exportCsv(collectionName);
    //     break;    
    //   default:
    //     fileData = MedicalRecordsExporter.exportJson(collectionName);
    //     break;
    // }

    // // var dataString = 'data:text/csv;charset=utf-8,' + encodeURIComponent(JSON.stringify(fileData, null, 2));  
    // var dataString = 'data:text/csv;charset=utf-8,' + encodeURIComponent(fileData);  
    // var downloadAnchorElement = document.getElementById('downloadAnchorElement');
    // if(downloadAnchorElement){
    //   downloadAnchorElement.setAttribute("href", dataString );
  
    //   downloadAnchorElement.setAttribute("download", collectionName + ".csv");
    //   downloadAnchorElement.click();
    //   // window.open('data:text/csv;charset=utf-8,' + escape(continuityOfCareDoc), '_self');    
    // } else {
    //   console.log('Couldnt find anchor element.')
    // }

  }
  function importCollection(collectionName){
    console.log('Exporting the ' + collectionName + ' collection.')

  }
  function dropCollection(resourceType){
    let collectionName = FhirUtilities.pluralizeResourceName(resourceType);

    console.log('Dropping the local ' + collectionName + ' collection.')

    if(Meteor.isClient){
      if(typeof window[collectionName] === "object"){
        window[collectionName].find().forEach(function(record){
          window[collectionName].remove({_id: record._id});
        });  
      }
    }
  }
  function drawPubSubIcon(subSubExists){
      return <Checkbox checked={subSubExists} />;
  }
  function renderIcon(resourceType){
    if(props.displayIcons){
        
      import { Icon } from 'react-icons-kit'
      import {fire} from 'react-icons-kit/icomoon/fire'
      import {ic_warning} from 'react-icons-kit/md/ic_warning'
      import {envelopeO} from 'react-icons-kit/fa/envelopeO' // Correspondence 
      import {ic_devices} from 'react-icons-kit/md/ic_devices';
      import {userMd} from 'react-icons-kit/fa/userMd'
      import {users} from 'react-icons-kit/fa/users'
      import {ic_question_answer} from 'react-icons-kit/md/ic_question_answer'      
      import {ic_transfer_within_a_station} from 'react-icons-kit/md/ic_transfer_within_a_station' // Encounters 
      import {ic_local_pharmacy} from 'react-icons-kit/md/ic_local_pharmacy'  // Medication, MedicationStatement, MedicationOrder  
      import {heartbeat} from 'react-icons-kit/fa/heartbeat' // Condition
      import {erlenmeyerFlask} from 'react-icons-kit/ionicons/erlenmeyerFlask' // Substance  
      import {hospitalO} from 'react-icons-kit/fa/hospitalO' // Hospital  
      import {bath} from 'react-icons-kit/fa/bath'  // Procedure  
      import {suitcase} from 'react-icons-kit/fa/suitcase' // Bundle
      import {notepad} from 'react-icons-kit/ikons/notepad'  // CarePlan ?
      import {iosPulseStrong} from 'react-icons-kit/ionicons/iosPulseStrong' // Pulse, Condition  
      import {location} from 'react-icons-kit/typicons/location' // Location
      import {eyedropper} from 'react-icons-kit/fa/eyedropper'
      import {dashboard} from 'react-icons-kit/fa/dashboard' //Dashboard
      import {list} from 'react-icons-kit/fa/list' //Dashboard
      import {addressCardO} from 'react-icons-kit/fa/addressCardO'  // Address Card  
      import {mapO} from 'react-icons-kit/fa/mapO'
      import {map} from 'react-icons-kit/fa/map'

      let iconToRender;

      switch (resourceType) {
        case "AllergyIntolerance":
          iconToRender = <Icon icon={ic_warning} />
          break;
        case "CarePlan":
          iconToRender = <Icon icon={notepad} />
          break;
        case "Condition":
          iconToRender = <Icon icon={heartbeat} />
          break;
        case "Device":
          iconToRender = <Icon icon={ic_devices} />
          break;
        case "DiagnosticReport":
          iconToRender = <Icon icon={notepad} />
          break;
        case "Encounter":
          iconToRender = <Icon icon={ic_transfer_within_a_station} />
          break;
        case "Immunization":
          iconToRender = <Icon icon={eyedropper} />
          break;
        case "Medication":
          iconToRender = <Icon icon={ic_local_pharmacy} />
          break;
        case "MedicationStatement":
          iconToRender = <Icon icon={ic_local_pharmacy} />
          break;
        case "Observation":
          iconToRender = <Icon icon={iosPulseStrong} />
          break;
        case "Patient":
          iconToRender = <Icon icon={users} />
          break;    
        case "Procedure":
          iconToRender = <Icon icon={bath} />
          break;    
      }

      return(
        <TableCell className="importAll">{iconToRender}</TableCell>
      )  
    }
  }
  function renderImportCheckmark(onChangeMethod, resourceType){
    // console.log('renderImportCheckmark', resourceType)
    if(displayImportCheckmarks){
      let checkedValue = false;
      if(get(data, 'collections.checkedImports')){
        checkedValue = data.collections.checkedImports[resourceType];
      }
      // console.log('renderImportCheckmark.checkedValue', checkedValue)
  
      return(
        <TableCell className="importAll">
          <Checkbox onChange={onChangeMethod} checked={checkedValue} />
        </TableCell>
      )  
    }
  }
  function renderExportCheckmark(onChangeMethod, resourceShorthand){    
    // console.log('renderExportCheckmark', resourceShorthand)

    if(props.displayExportCheckmarks){
      let checkedValue = false;
      if(get(data, 'collections.checkedExports')){
        checkedValue = get(data, "collections.checkedExports." + resourceShorthand);
      }
      // console.log('renderExportCheckmark.checkedValue', checkedValue)
      return(
        <TableCell className="exportAll"><Checkbox onChange={onChangeMethod} checked={checkedValue} /></TableCell>
      )  
    }
  }
  function renderDropButton(resourceType, resourceShorthand){
    if(props.displayDropButton){

      let cellStyle = {
        cursor: 'pointer',
        color: 'black'
      }
      if(get(data, 'collections.pubsub') && get(data, "collections.pubsub." + resourceShorthand)){
        if(data.collections.pubsub[resourceType] === true){
          cellStyle.color = 'lightgray';
        }
      }

      return(
        <TableCell className="dropButton" style={cellStyle} onClick={dropCollection.bind(this, resourceType)} >Drop</TableCell>
      )  
    }
  }
  function renderPreview(collectionName){
    if(props.displayPreview){
      let displayText = 0;
      if(get(data, 'collections.preview') && data.collections.preview[collectionName]){
        displayText = data.collections.preview[collectionName];
      }

      return(
        <TableCell className="dropButton" style={{cursor: 'pointer'}}>{displayText}</TableCell>
      )  
    }
  }
  function renderClientCount(collectionName){
    if(props.displayClientCount){
      let displayText = 0;
      if(get(data, 'collections.client') && data.collections.client[collectionName]){
        displayText = data.collections.client[collectionName];
      }

      return(
        <TableCell className="clientCount" style={{cursor: 'pointer'}}>{displayText}</TableCell>
      )  
    }
  }
  function renderLocalClientCount(collectionName){
    if(props.displayLocalClientCount){
      let displayText = 0;
      if(get(data, 'collections.localClient') && data.collections.localClient[collectionName]){
        displayText = data.collections.localClient[collectionName];
      }

      return(
        <TableCell className="localClientCount" style={{cursor: 'pointer'}}>{displayText}</TableCell>
      )  
    }
  }
  function renderPubSub(resourceType){
    if(props.displayPubSubEnabled){

      let icon;      
      if(get(data, 'collections.pubsub') && data.collections.pubsub[resourceType]){
        if(data.collections.pubsub[resourceType] === true){
          icon = <Icon icon={ic_wifi_tethering} style={{fontSize: '120%'}} />
        }
      }

      return(
        <TableCell className="pubSub" style={{cursor: 'pointer'}}>
          { icon }
        </TableCell>
      )  
    }
  }
  function renderPubSubHeader(){
    if(props.displayPubSubEnabled){
      return(
        <TableCell className="pubSub">PubSub</TableCell>
      )  
    }
  }
  function renderExportButton(collectionName){
    if(props.displayExportButton){
      return(
        <TableCell className="exportButton" style={{cursor: 'pointer'}} onClick={exportCollection.bind(this, collectionName)}>Export</TableCell>
      )  
    }
  }
  function renderImportButton(collectionName){
    if(props.displayImportButton){
      return(
        <TableCell className="importButton" style={{cursor: 'pointer'}} onClick={importCollection.bind(this, collectionName)}>Import</TableCell>
      )  
    }
  }
  function renderPreviewHeader(){
    if(props.displayPreview){
      return(
        <TableCell className="preview">Preview</TableCell>
      )  
    }
  }
  function renderClientCountHeader(){
    if(props.displayClientCount){
      return(
        <TableCell className="clientCount">Client #</TableCell>
      )  
    }
  }
  function renderLocalClientCountHeader(){
    if(props.displayLocalClientCount){
      return(
        <TableCell className="localClientCount">Local Client #</TableCell>
      )  
    }
  }
  function renderDropButtonHeader(){
    if(props.displayDropButton){
      return(
        <TableCell className="dropButton">Drop</TableCell>
      )  
    }
  }
  function renderExportButtonHeader(){
    if(props.displayExportButton){
      return(
        <TableCell className="exportButton">Export</TableCell>
      )  
    }
  }
  function renderImportButtonHeader(){
    if(props.displayImportButton){
      return(
        <TableCell className="importButton">Import</TableCell>
      )  
    }
  }
  function renderIconHeader(){
    if(props.displayIcons){
      return(
        <TableCell className="icon"></TableCell>
      )  
    }
  }
  function renderImportCheckmarkHeader(){
    if(displayImportCheckmarks){
      let allChecked = get(data, 'collections.checkedImports.importsAll', false)
      return(
        <TableCell className="importAll">
          <Checkbox onChange={toggleAllImports.bind(this)} checked={allChecked} />
        </TableCell>
      )  
    }
  }
  function renderExportCheckmarkHeader(){
    if(props.displayExportCheckmarks){
      let exportsAllChecked = get(this, 'data.collections.checkedExports.exportsAll', false)
      return(
        <TableCell className="exportAll"><Checkbox onChange={toggleAllExports.bind(this)} checked={exportsAllChecked} /></TableCell>
      )  
    }
  }
  
  function determineRowVisible(resourceName){
    //console.log('determineRowVisible', props, resourceName)
    let allowed = false;
    switch (props.mode) {
      case 'import':
        allowed = true;
        break;
      case 'export':        
        if(data.collections.client[resourceName] > 0){
          allowed = true;
        }
        break;
      case 'specific':        
        // we want specific resource types (that may be scanned and inbound)
        if(Array.isArray(props.resourceTypes)){
          if(props.resourceTypes.includes(resourceName)){
            allowed = true;
          }          
        }
        break;
      case 'additive':        
        // we want specific resource types (that may be scanned and inbound)        
        if(Array.isArray(props.resourceTypes)){
          if(props.resourceTypes.includes(resourceName)){
            allowed = true;
          }          
        }   
        if(data.collections.client[resourceName] > 0){
          allowed = true;
        }
        break;        
      default:
        allowed = true;
        break;
    }
    return allowed;
  }
  function initializeCollection(collection){
    console.log("initializeCollection", collection);

    if (confirm('Are you sure?')) {
      if(collection === "Lists"){
        Meteor.call('initializeChecklilsts', function(error, result){
          if(result){
            console.log('result', result)
          }
        });

      }
    }
    
  }
  function callMethod(signature){
    console.log("callMethod", signature);

      if (confirm('Are you sure?')) {
        Meteor.call(signature, function(error, result){
          Meteor.call('getServerStats', function(error, result){
            if(result){
              Session.set('datalakeStats', result);
            }
          });
        });
      }
  }


  // REFACTOR (DONT DELETE)
  // let dynamicRows = {};
  // collectionNamesToParse.forEach(function(collectionName){
  //   dynamicRows[singularizeResourceName(collectionName) + "Row"] = null;
  //   if(determineRowVisible(collectionName)){
  //     shouldDisplayNoDataRow = false;
  //     dynamicRows[collectionName + "Row"] = <TableRow className='dataManagementRow' hover={true}>
  //       { renderIcon(singularizeResourceName(collectionName)) }
  //       { renderImportCheckmark(methods.toggleConditions.bind(this), collectionName) }
  //       { renderImportButton(collectionName)} 
  //       <TableCell className="collection">{collectionName}</TableCell>
  //       { renderPreview(singularizeResourceName(collectionName))} 
  //       { renderClientCount(singularizeResourceName(collectionName))} 
  //       { renderLocalClientCount(singularizeResourceName(collectionName))} 
  //       { renderPubSub(singularizeResourceName(collectionName))} 
  //       { renderDropButton(singularizeResourceName(collectionName))} 
  //       { renderExportButton(collectionName)} 
  //       { renderExportCheckmark(exportMethods.toggleConditionsExport.bind(this), singularizeResourceName(collectionName)) }
  //     </TableRow>
  //   }    
  // })

  let shouldDisplayNoDataRow = true;

  let allergyIntolerancesRow;
  if(determineRowVisible("AllergyIntolerance")){
    shouldDisplayNoDataRow = false;
    allergyIntolerancesRow = <TableRow className='dataManagementRow' hover={true}>
      { renderIcon("AllergyIntolerance") }
      { renderImportCheckmark(methods.toggleAllergies.bind(this), 'AllergyIntolerance') }
      { renderImportButton('AllergyIntolerances')} 
      <TableCell className="collection">Allergy Intolerance</TableCell>
      { renderPreview('AllergyIntolerance')} 
      { renderClientCount('AllergyIntolerance')} 
      { renderLocalClientCount('AllergyIntolerance')} 
      { renderPubSub('AllergyIntolerance')} 
      { renderDropButton('AllergyIntolerance')} 
      { renderExportButton('AllergyIntolerances')} 
      { renderExportCheckmark(exportMethods.toggleAllergiesExport.bind(this), 'AllergyIntolerance') }
    </TableRow>
  }

  let appointmentsRow;
  if(determineRowVisible("Appointment")){
    shouldDisplayNoDataRow = false;
    appointmentsRow = <TableRow className='dataManagementRow' hover={true}>
      { renderIcon("Appointment") }
      { renderImportCheckmark(methods.toggleAppointments.bind(this), 'Appointment') }
      { renderImportButton('Appointments')} 
      <TableCell className="collection">Appointments</TableCell>
      { renderPreview('Appointment')} 
      { renderClientCount('Appointment')} 
      { renderLocalClientCount('Appointment')} 
      { renderPubSub('Appointment')} 
      { renderDropButton('Appointment')} 
      { renderExportButton('Appointments')} 
      { renderExportCheckmark(exportMethods.toggleAppointmentsExport.bind(this), 'Appointment') }
    </TableRow>
  }

  let bundlesRow;
  if(determineRowVisible("Bundle")){
    shouldDisplayNoDataRow = false;
    bundlesRow = <TableRow className='dataManagementRow' hover={true}>
      { renderIcon("Bundle") }
      { renderImportCheckmark(methods.toggleBundles.bind(this), 'Bundle') }
      { renderImportButton('Bundles')} 
      <TableCell className="collection">Bundles</TableCell>
      { renderPreview('Bundle')} 
      { renderClientCount('Bundle')} 
      { renderLocalClientCount('Bundle')} 
      { renderPubSub('Bundle')} 
      { renderDropButton('Bundle')} 
      { renderExportButton('Bundles')} 
      { renderExportCheckmark(exportMethods.toggleBundlesExport.bind(this), 'Bundle') }
    </TableRow>
  }

  let carePlansRow;
  if(determineRowVisible("CarePlan")){
    shouldDisplayNoDataRow = false;
    carePlansRow = <TableRow className='dataManagementRow' hover={true}>
      { renderIcon("CarePlan") }
      { renderImportCheckmark(methods.toggleCarePlans.bind(this), 'CarePlan') }
      { renderImportButton('CarePlans')} 
      <TableCell className="collection">Care Plans</TableCell>
      { renderPreview('CarePlan')} 
      { renderClientCount('CarePlan')} 
      { renderLocalClientCount('CarePlan')} 
      { renderPubSub('CarePlan')}       
      { renderDropButton('CarePlan')} 
      { renderExportButton('CarePlans')} 
      { renderExportCheckmark(exportMethods.toggleCarePlansExport.bind(this), 'CarePlan') }
    </TableRow>
  }

  let careTeamsRow;
  if(determineRowVisible("CareTeam")){
    shouldDisplayNoDataRow = false;
    careTeamsRow = <TableRow className='dataManagementRow' hover={true}>
      { renderIcon("CareTeam") }
      { renderImportCheckmark(methods.toggleCareTeams.bind(this), 'CareTeam') }
      { renderImportButton('CareTeams')} 
      <TableCell className="collection">Care Plans</TableCell>
      { renderPreview('CareTeam')} 
      { renderClientCount('CareTeam')} 
      { renderLocalClientCount('CareTeam')} 
      { renderPubSub('CareTeam')}       
      { renderDropButton('CareTeam')} 
      { renderExportButton('CareTeams')} 
      { renderExportCheckmark(exportMethods.toggleCareTeamsExport.bind(this), 'CareTeam') }
    </TableRow>
  }

  let claimsRow;
  if(determineRowVisible("Claim")){
    shouldDisplayNoDataRow = false;
      claimsRow = <TableRow className='dataManagementRow' hover={true}>
      { renderIcon("Claim") }
      { renderImportCheckmark(methods.toggleClaims.bind(this), 'Claim') }
      { renderImportButton('Claims')} 
      <TableCell className="collection">Claims</TableCell>
      { renderPreview('Claim')} 
      { renderClientCount('Claim')} 
      { renderLocalClientCount('Claim')} 
      { renderPubSub('Claim')}       
      { renderDropButton('Claim')} 
      { renderExportButton('Claims')} 
      { renderExportCheckmark(exportMethods.toggleClaimsExport.bind(this), 'Claim') }
    </TableRow>
  }

  let clinicalDocumentsRow;
  if(determineRowVisible("ClinicalDocument")){
    shouldDisplayNoDataRow = false;
    clinicalDocumentsRow = <TableRow className='dataManagementRow' hover={true}>
      { renderIcon("ClinicalDocument") }
      { renderImportCheckmark(methods.toggleClinicalDocuments.bind(this), 'ClinicalDocument') }
      { renderImportButton('ClinicalDocuments')} 
      <TableCell className="collection">Clinical Documents</TableCell>
      { renderPreview('ClinicalDocument')} 
      { renderClientCount('ClinicalDocument')} 
      { renderLocalClientCount('ClinicalDocument')} 
      { renderPubSub('ClinicalDocument')} 
      { renderDropButton('ClinicalDocument')} 
      { renderExportButton('ClinicalDocuments')} 
      { renderExportCheckmark(exportMethods.toggleClinicalDocumentsExport.bind(this), 'ClinicalDocument') }
    </TableRow>
  }

  let clinicalImpressionsRow;
  if(determineRowVisible("ClinicalImpression")){
    shouldDisplayNoDataRow = false;
    clinicalImpressionsRow = <TableRow className='dataManagementRow' hover={true}>
      { renderIcon("ClinicalImpression") }
      { renderImportCheckmark(methods.toggleClinicalImpressions.bind(this), 'ClinicalImpression') }
      { renderImportButton('ClinicalImpressions')} 
      <TableCell className="collection">Clinical Impressions</TableCell>
      { renderPreview('ClinicalImpression')} 
      { renderClientCount('ClinicalImpression')} 
      { renderLocalClientCount('ClinicalImpression')} 
      { renderPubSub('ClinicalImpression')} 
      { renderDropButton('ClinicalImpression')} 
      { renderExportButton('ClinicalImpressions')} 
      { renderExportCheckmark(exportMethods.toggleClinicalImpressionsExport.bind(this), 'ClinicalImpression') }
    </TableRow>
  }

  let codeSystemsRow;
  if(determineRowVisible("CodeSystem")){
    shouldDisplayNoDataRow = false;
    codeSystemsRow = <TableRow className='dataManagementRow' hover={true}>
      { renderIcon("CodeSystem") }
      { renderImportCheckmark(methods.toggleCodeSystems.bind(this), 'CodeSystem') }
      { renderImportButton('CodeSystems')} 
      <TableCell className="collection">CodeSystems</TableCell>
      { renderPreview('CodeSystem')} 
      { renderClientCount('CodeSystem')} 
      { renderLocalClientCount('CodeSystem')} 
      { renderPubSub('CodeSystem')} 
      { renderDropButton('CodeSystem')} 
      { renderExportButton('CodeSystems')} 
      { renderExportCheckmark(exportMethods.toggleCodeSystemsExport.bind(this), 'CodeSystem') }
    </TableRow>
  }

  let conditionsRow;
  if(determineRowVisible("Condition")){
    shouldDisplayNoDataRow = false;
    conditionsRow = <TableRow className='dataManagementRow' hover={true}>
      { renderIcon("Condition") }
      { renderImportCheckmark(methods.toggleConditions.bind(this), 'Condition') }
      { renderImportButton('Conditions')} 
      <TableCell className="collection">Conditions</TableCell>
      { renderPreview('Condition')} 
      { renderClientCount('Condition')} 
      { renderLocalClientCount('Condition')} 
      { renderPubSub('Condition')} 
      { renderDropButton('Condition')} 
      { renderExportButton('Conditions')} 
      { renderExportCheckmark(exportMethods.toggleConditionsExport.bind(this), 'Condition') }
    </TableRow>
  }

  let consentsRow;
  if(determineRowVisible("Consent")){
    shouldDisplayNoDataRow = false;
    consentsRow = <TableRow className='dataManagementRow' hover={true}>
      { renderIcon("Consent") }
      { renderImportCheckmark(methods.toggleConsents.bind(this), 'Consent') }
      { renderImportButton('Consents')} 
      <TableCell className="collection">Consents</TableCell>
      { renderPreview('Consent')} 
      { renderClientCount('Consent')} 
      { renderLocalClientCount('Consent')} 
      { renderPubSub('Consent')} 
      { renderDropButton('Consent')} 
      { renderExportButton('Consents')} 
      { renderExportCheckmark(exportMethods.toggleConsentsExport.bind(this), 'Consent') }
    </TableRow>
  }

  let contractsRow;
  if(determineRowVisible("Contract")){
    shouldDisplayNoDataRow = false;
    contractsRow = <TableRow className='dataManagementRow' hover={true}>
      { renderIcon("Contract") }
      { renderImportCheckmark(methods.toggleContracts.bind(this), 'Contract') }
      { renderImportButton('Contracts')} 
      <TableCell className="collection">Contracts</TableCell>
      { renderPreview('Contract')} 
      { renderClientCount('Contract')} 
      { renderLocalClientCount('Contract')} 
      { renderPubSub('Contract')}       
      { renderDropButton('Contract')} 
      { renderExportButton('Contracts')} 
      { renderExportCheckmark(exportMethods.toggleContractsExport.bind(this), 'Contract') }
    </TableRow>
  }

  let communicationsRow;
  if(determineRowVisible("Communication")){
    shouldDisplayNoDataRow = false;
    communicationsRow = <TableRow className='dataManagementRow' hover={true}>
      { renderIcon("Communication") }
      { renderImportCheckmark(methods.toggleCommunications.bind(this), 'Communication') }
      { renderImportButton('Communications')} 
      <TableCell className="collection">Communications</TableCell>
      { renderPreview('Communication')} 
      { renderClientCount('Communication')} 
      { renderLocalClientCount('Communication')} 
      { renderPubSub('Communication')} 
      { renderDropButton('Communication')} 
      { renderExportButton('Communications')} 
      { renderExportCheckmark(exportMethods.toggleCommunicationsExport.bind(this), 'Communication') }
    </TableRow>
  }

  let communicationResponsesRow;
  if(determineRowVisible("CommunicationResponse")){
    shouldDisplayNoDataRow = false;
    communicationResponsesRow = <TableRow className='dataManagementRow' hover={true}>
      { renderIcon("CommunicationResponse") }
      { renderImportCheckmark(methods.toggleCommunications.bind(this), 'CommunicationResponse') }
      { renderImportButton('CommunicationResponses')} 
      <TableCell className="collection">Communication Responses</TableCell>
      { renderPreview('CommunicationResponse')} 
      { renderClientCount('CommunicationResponse')} 
      { renderLocalClientCount('CommunicationResponse')} 
      { renderPubSub('CommunicationResponse')} 
      { renderDropButton('CommunicationResponse')} 
      { renderExportButton('CommunicationResponses')} 
      { renderExportCheckmark(exportMethods.toggleCommunicationResponsesExport.bind(this), 'CommunicationResponse') }
    </TableRow>
  }

  let communicationRequestsRow;
  if(determineRowVisible("CommunicationRequest")){
    shouldDisplayNoDataRow = false;
    communicationRequestsRow = <TableRow className='dataManagementRow' hover={true}>
      { renderIcon("CommunicationRequest") }
      { renderImportCheckmark(methods.toggleCommunications.bind(this), 'CommunicationRequest') }
      { renderImportButton('CommunicationRequests')} 
      <TableCell className="collection">Communication Requests</TableCell>
      { renderPreview('CommunicationRequest')} 
      { renderClientCount('CommunicationRequest')} 
      { renderLocalClientCount('CommunicationRequest')} 
      { renderPubSub('CommunicationRequest')} 
      { renderDropButton('CommunicationRequest')} 
      { renderExportButton('CommunicationRequests')} 
      { renderExportCheckmark(exportMethods.toggleCommunicationRequestsExport.bind(this), 'CommunicationRequest') }
    </TableRow>
  }

  let devicesRow;
  if(determineRowVisible("Device")){
    shouldDisplayNoDataRow = false;
    devicesRow = <TableRow className='dataManagementRow'  hover={true}>
      { renderIcon("Device") }
      { renderImportCheckmark(methods.toggleDevices.bind(this), 'Device') }
      { renderImportButton('Devices')} 
      <TableCell className="collection">Devices</TableCell>
      { renderPreview('Device')} 
      { renderClientCount('Device')} 
      { renderLocalClientCount('Device')} 
      { renderPubSub('Device')} 
      { renderDropButton('Device')} 
      { renderExportButton('Devices')} 
      { renderExportCheckmark(exportMethods.toggleDevicesExport.bind(this), 'Device') }
    </TableRow>
  }

  let diagnosticReportsRow;
  if(determineRowVisible("DiagnosticReport")){
    shouldDisplayNoDataRow = false;
    diagnosticReportsRow = <TableRow className='dataManagementRow' hover={true}>
      { renderIcon("DiagnosticReport") }
      { renderImportCheckmark(methods.toggleDiagnosticReports.bind(this), 'DiagnosticReport') }
      { renderImportButton('DiagnosticReports')} 
      <TableCell className="collection">Diagnostic Reports</TableCell>
      { renderPreview('DiagnosticReport')} 
      { renderClientCount('DiagnosticReport')} 
      { renderLocalClientCount('DiagnosticReport')} 
      { renderPubSub('DiagnosticReport')} 
      { renderDropButton('DiagnosticReport')} 
      { renderExportButton('DiagnosticReports')} 
      { renderExportCheckmark(exportMethods.toggleDiagnosticReportsExport.bind(this), 'DiagnosticReport') }
    </TableRow>
  }

  let documentReferencesRow;
  if(determineRowVisible("DocumentReference")){
    shouldDisplayNoDataRow = false;
    documentReferencesRow = <TableRow className='dataManagementRow' hover={true}>
      { renderImportCheckmark(methods.toggleDocumentReferences.bind(this), 'DocumentReference') }
      { renderImportButton('DocumentReferences')} 
      <TableCell className="collection">Document Reference</TableCell>
      { renderPreview('DocumentReference')} 
      { renderClientCount('DocumentReference')} 
      { renderLocalClientCount('DocumentReference')} 
      { renderPubSub('DocumentReference')} 
      { renderDropButton('DocumentReference')} 
      { renderExportButton('DocumentReferences')} 
      { renderExportCheckmark(exportMethods.toggleDocumentReferencesExport.bind(this), 'DocumentReference') }
    </TableRow>
  }

  let encountersRow;
  if(determineRowVisible("Encounter")){
    shouldDisplayNoDataRow = false;
    encountersRow = <TableRow className='dataManagementRow'  hover={true}>
      { renderIcon("Encounter") }
      { renderImportCheckmark(methods.toggleEncounters.bind(this), 'Encounter') }
      { renderImportButton('Encounters')} 
      <TableCell className="collection">Encounters</TableCell>
      { renderPreview('Encounter')} 
      { renderClientCount('Encounter')} 
      { renderLocalClientCount('Encounter')} 
      { renderPubSub('Encounter')} 
      { renderDropButton('Encounter')} 
      { renderExportButton('Encounters')} 
      { renderExportCheckmark(exportMethods.toggleEncountersExport.bind(this), 'Encounter') }
    </TableRow>
  }

  let endpointsRow;
  if(determineRowVisible("Endpoint")){
    shouldDisplayNoDataRow = false;
    endpointsRow = <TableRow className='dataManagementRow'  hover={true}>
      { renderIcon("Endpoint") }
      { renderImportCheckmark(methods.toggleDevices.bind(this), 'Endpoint') }
      { renderImportButton('Endpoints')}       
      <TableCell className="collection">Endpoint</TableCell>
      { renderPreview('Endpoint')} 
      { renderClientCount('Endpoint')} 
      { renderLocalClientCount('Endpoint')} 
      { renderPubSub('Endpoint')} 
      { renderDropButton('Endpoint')} 
      { renderExportButton('Endpoints')} 
      { renderExportCheckmark(exportMethods.toggleEndpointsExport.bind(this), 'Endpoint') }
    </TableRow>
  }

  let explanationOfBenefitsRow;
  if(determineRowVisible("ExplanationOfBenefit")){
    shouldDisplayNoDataRow = false;
    explanationOfBenefitsRow = <TableRow className='dataManagementRow'  hover={true}>
      { renderIcon("ExplanationOfBenefit") }
      { renderImportCheckmark(methods.toggleDevices.bind(this), 'ExplanationOfBenefit') }
      { renderImportButton('ExplanationOfBenefits')} 
      <TableCell className="collection">Explanation Of Benefit</TableCell>
      { renderPreview('ExplanationOfBenefit')} 
      { renderClientCount('ExplanationOfBenefit')} 
      { renderLocalClientCount('ExplanationOfBenefit')} 
      { renderPubSub('ExplanationOfBenefit')} 
      { renderDropButton('ExplanationOfBenefit')} 
      { renderExportButton('ExplanationOfBenefits')} 
      { renderExportCheckmark(exportMethods.toggleExplanationOfBenefitsExport.bind(this), 'ExplanationOfBenefit') }
    </TableRow>
  }

  let familyMemberHistoriesRow;
  if(determineRowVisible("FamilyMemberHistory")){
    shouldDisplayNoDataRow = false;
    familyMemberHistoriesRow = <TableRow className='dataManagementRow'  hover={true}>
      { renderIcon("FamilyMemberHistory") }
      { renderImportCheckmark(methods.toggleFamilyMemberHistories.bind(this), 'FamilyMemberHistory') }
      { renderImportButton('FamlyMemberHistories')} 
      <TableCell className="collection">Famly Member Histories</TableCell>
      { renderPreview('FamilyMemberHistory')} 
      { renderClientCount('FamilyMemberHistory')} 
      { renderLocalClientCount('FamilyMemberHistory')} 
      { renderPubSub('FamilyMemberHistory')} 
      { renderDropButton('FamilyMemberHistory')} 
      { renderExportButton('FamilyMemberHistories')} 
      { renderExportCheckmark(exportMethods.toggleFamilyMemberHistoriesExport.bind(this), 'FamilyMemberHistory') }
    </TableRow>
  }

  let goalsRow;
  if(determineRowVisible("Goal")){
    shouldDisplayNoDataRow = false;
    goalsRow = <TableRow className='dataManagementRow' hover={true}>
      { renderIcon("Goal") }
      { renderImportCheckmark(methods.toggleGoals.bind(this), 'Goal') }
      { renderImportButton('Goals')} 
      <TableCell className="collection">Goals</TableCell>
      { renderPreview('Goal')} 
      { renderClientCount('Goal')} 
      { renderLocalClientCount('Goal')} 
      { renderPubSub('Goal')} 
      { renderDropButton('Goal')} 
      { renderExportButton('Goals')} 
      { renderExportCheckmark(exportMethods.toggleGoalsExport.bind(this), 'Goal') }
    </TableRow>
  }

  let healthcareServicesRow;
  if(determineRowVisible("HealthcareService")){
    shouldDisplayNoDataRow = false;
    healthcareServicesRow = <TableRow className='dataManagementRow' hover={true}>
      { renderIcon("HealthcareService") }
      { renderImportCheckmark(methods.toggleHealthcareServices.bind(this), 'HealthcareService') }
      { renderImportButton('HealthcareServices')} 
      <TableCell className="collection">HealthcareServices</TableCell>
      { renderPreview('HealthcareService')} 
      { renderClientCount('HealthcareService')} 
      { renderLocalClientCount('HealthcareService')} 
      { renderPubSub('HealthcareService')} 
      { renderDropButton('HealthcareService')} 
      { renderExportButton('HealthcareServices')} 
      { renderExportCheckmark(exportMethods.toggleHealthcareServicesExport.bind(this), 'HealthcareService') }
    </TableRow>
  }

  let immunizationsRow;
  if(determineRowVisible("Immunization")){
    shouldDisplayNoDataRow = false;
    immunizationsRow = <TableRow className='dataManagementRow' hover={true}>
      { renderIcon("Immunization") }
      { renderImportCheckmark(methods.toggleImmunizations.bind(this), 'Immunization') }
      { renderImportButton('Immunizations')} 
      <TableCell className="collection">Immunizations</TableCell>
      { renderPreview('Immunization')} 
      { renderClientCount('Immunization')} 
      { renderLocalClientCount('Immunization')} 
      { renderPubSub('Immunization')} 
      { renderDropButton('Immunization')} 
      { renderExportButton('Immunizations')} 
      { renderExportCheckmark(exportMethods.toggleImmunizationsExport.bind(this), 'Immunization') }
    </TableRow>
  }


  let insurancePlansRow;
  if(determineRowVisible("InsurancePlan")){
    shouldDisplayNoDataRow = false;
    insurancePlansRow = <TableRow className='dataManagementRow' hover={true}>
      { renderIcon("InsurancePlan") }
      { renderImportCheckmark(methods.toggleInsurancePlans.bind(this), 'InsurancePlan') }
      { renderImportButton('InsurancePlans')} 
      <TableCell className="collection">InsurancePlans</TableCell>
      { renderPreview('InsurancePlan')} 
      { renderClientCount('InsurancePlan')} 
      { renderLocalClientCount('InsurancePlan')} 
      { renderPubSub('InsurancePlan')} 
      { renderDropButton('InsurancePlan')} 
      { renderExportButton('InsurancePlans')} 
      { renderExportCheckmark(exportMethods.toggleInsurancePlansExport.bind(this), 'InsurancePlan') }
    </TableRow>
  }

  let imagingStudiesRow;
  if(determineRowVisible("ImagingStudy")){
    shouldDisplayNoDataRow = false;
    imagingStudiesRow = <TableRow className='dataManagementRow' hover={true}>
      { renderIcon("ImagingStudy") }
      { renderImportCheckmark(methods.toggleImmagingStudies.bind(this), 'ImagingStudy') }
      { renderImportButton('ImagingStudies')} 
      <TableCell className="collection">ImagingStudies</TableCell>
      { renderPreview('ImagingStudy')} 
      { renderClientCount('ImagingStudy')} 
      { renderLocalClientCount('ImagingStudy')} 
      { renderPubSub('ImagingStudy')} 
      { renderDropButton('ImagingStudy')} 
      { renderExportButton('ImagingStudies')} 
      { renderExportCheckmark(exportMethods.toggleImagingStudiesExport.bind(this), 'ImagingStudy') }
    </TableRow> 
  }

  let listsRow;
  if(determineRowVisible("List")){
    shouldDisplayNoDataRow = false;
    listsRow = <TableRow className='dataManagementRow' hover={true}>
      { renderIcon("List") }
      { renderImportCheckmark(methods.toggleLists.bind(this), 'List') }
      { renderImportButton('Lists')} 
      <TableCell className="collection">Lists</TableCell>
      { renderPreview('List')} 
      { renderClientCount('List')} 
      { renderLocalClientCount('List')} 
      { renderPubSub('List')} 
      { renderDropButton('List')} 
      { renderExportButton('Lists')} 
      { renderExportCheckmark(exportMethods.toggleListsExport.bind(this), 'List') }
    </TableRow>
  }

  let locationsRow;
  if(determineRowVisible("Location")){
    shouldDisplayNoDataRow = false;
    locationsRow = <TableRow className='dataManagementRow' hover={true}>
      { renderIcon("Location") }
      { renderImportCheckmark(methods.toggleLocations.bind(this), 'Location') }
      { renderImportButton('Locations')} 
      <TableCell className="collection">Locations</TableCell>
      { renderPreview('Location')} 
      { renderClientCount('Location')} 
      { renderLocalClientCount('Location')} 
      { renderPubSub('Location')} 
      { renderDropButton('Location')} 
      { renderExportButton('Locations')} 
      { renderExportCheckmark(exportMethods.toggleLocationsExport.bind(this), 'Location') }
    </TableRow>
  }

  let measuresRow;
  if(determineRowVisible("Measure")){
    shouldDisplayNoDataRow = false;
    measuresRow = <TableRow className='dataManagementRow'  hover={true}>
      { renderIcon("Measure") }
      { renderImportCheckmark(methods.toggleMeasures.bind(this), 'Measure') }
      { renderImportButton('Measures')} 
      <TableCell className="collection">Measures</TableCell>
      { renderPreview('Measure')} 
      { renderClientCount('Measure')} 
      { renderLocalClientCount('Measure')} 
      { renderPubSub('Measure')} 
      { renderDropButton('Measure')} 
      { renderExportButton('Measures')} 
      { renderExportCheckmark(exportMethods.toggleMeasuresExport.bind(this), 'Measure') }
    </TableRow>
  }

  let measureReportsRow;
  if(determineRowVisible("MeasureReport")){
    shouldDisplayNoDataRow = false;
    measureReportsRow = <TableRow className='dataManagementRow'  hover={true}>
      { renderIcon("MeasureReport") }
      { renderImportCheckmark(methods.toggleMeasureReports.bind(this), 'MeasureReport') }
      { renderImportButton('MeasureReports')} 
      <TableCell className="collection">MeasureReports</TableCell>
      { renderPreview('MeasureReport')} 
      { renderClientCount('MeasureReport')} 
      { renderLocalClientCount('MeasureReport')} 
      { renderPubSub('MeasureReport')} 
      { renderDropButton('MeasureReport')} 
      { renderExportButton('MeasureReports')} 
      { renderExportCheckmark(exportMethods.toggleMeasureReportsExport.bind(this), 'MeasureReport') }
    </TableRow>
  }

  let medicationsRow;
  if(determineRowVisible("Medication")){
    shouldDisplayNoDataRow = false;
    medicationsRow = <TableRow className='dataManagementRow'  hover={true}>
      { renderIcon("Medication") }
      { renderImportCheckmark(methods.toggleMedications.bind(this), 'Medication') }
      { renderImportButton('Medications')} 
      <TableCell className="collection">Medications</TableCell>
      { renderPreview('Medication')} 
      { renderClientCount('Medication')} 
      { renderLocalClientCount('Medication')} 
      { renderPubSub('Medication')} 
      { renderDropButton('Medication')} 
      { renderExportButton('Medications')} 
      { renderExportCheckmark(exportMethods.toggleMedicationsExport.bind(this), 'Medication') }
    </TableRow>
  }

  let medicationOrdersRow;
  if(determineRowVisible("MedicationOrder")){
    shouldDisplayNoDataRow = false;
    medicationOrdersRow = <TableRow className='dataManagementRow'  hover={true}>
      { renderIcon("MedicationOrder") }
      { renderImportCheckmark(methods.toggleMedicationOrders.bind(this), 'MedicationOrder') }
      { renderImportButton('MedicationOrders')} 
      <TableCell className="collection">MedicationOrders</TableCell>
      { renderPreview('MedicationOrder')} 
      { renderClientCount('MedicationOrder')} 
      { renderLocalClientCount('MedicationOrder')} 
      { renderPubSub('MedicationOrder')}       
      { renderDropButton('MedicationOrder')} 
      { renderExportButton('MedicationOrders')} 
      { renderExportCheckmark(exportMethods.toggleMedicationOrdersExport.bind(this), 'MedicationOrder') }
    </TableRow>
  }

  let medicationStatementsRow;
  if(determineRowVisible("MedicationStatement")){
    shouldDisplayNoDataRow = false;
    medicationStatementsRow = <TableRow className='dataManagementRow'  hover={true}>
      { renderIcon("MedicationStatement") }
      { renderImportCheckmark(methods.toggleMedicationStatements.bind(this), 'MedicationStatement') }
      { renderImportButton('MedicationStatements')} 
      <TableCell className="collection">MedicationStatements</TableCell>
      { renderPreview('MedicationStatement')} 
      { renderClientCount('MedicationStatement')} 
      { renderLocalClientCount('MedicationStatement')} 
      { renderPubSub('MedicationStatement')} 
      { renderDropButton('MedicationStatement')} 
      { renderExportButton('MedicationStatements')} 
      { renderExportCheckmark(exportMethods.toggleMedicationStatementsExport.bind(this), 'MedicationStatement') }
    </TableRow>
  }

  let messageHeadersRow;
  if(determineRowVisible("MessageHeader")){
    shouldDisplayNoDataRow = false;
    messageHeadersRow = <TableRow className='dataManagementRow'  hover={true}>
      { renderIcon("MessageHeader") }
      { renderImportCheckmark(methods.toggleMessageHeaders.bind(this), 'MessageHeader') }
      { renderImportButton('MessageHeaders')} 
      <TableCell className="collection">Message Headers</TableCell>
      { renderPreview('MessageHeader')} 
      { renderClientCount('MessageHeader')} 
      { renderLocalClientCount('MessageHeader')} 
      { renderPubSub('MessageHeader')} 
      { renderDropButton('MessageHeader')} 
      { renderExportButton('MessageHeaders')} 
      { renderExportCheckmark(exportMethods.toggleMessageHeadersExport.bind(this), 'MessageHeader') }
    </TableRow>
  }

  let networksRow;
  if(determineRowVisible("Network")){
    shouldDisplayNoDataRow = false;
    networksRow = <TableRow className='dataManagementRow'  hover={true}>
      { renderIcon("Network") }
      { renderImportCheckmark(methods.toggleNetworks.bind(this), 'Network') }
      { renderImportButton('Networks')} 
      <TableCell className="collection">Networks</TableCell>
      { renderPreview('Network')} 
      { renderClientCount('Network')} 
      { renderLocalClientCount('Network')} 
      { renderPubSub('Network')} 
      { renderDropButton('Network')} 
      { renderExportButton('Networks')} 
      { renderExportCheckmark(exportMethods.toggleNetworksExport.bind(this), 'Network') }
    </TableRow>
  }

  let observationsRow;
  if(determineRowVisible("Observation")){
    shouldDisplayNoDataRow = false;
    observationsRow = <TableRow className='dataManagementRow'  hover={true}>
      { renderIcon("Observation") }
      { renderImportCheckmark(methods.toggleObservations.bind(this), 'Observation') }
      { renderImportButton('Observations')} 
      <TableCell className="collection">Observations</TableCell>
      { renderPreview('Observation')} 
      { renderClientCount('Observation')} 
      { renderLocalClientCount('Observation')} 
      { renderPubSub('Observation')} 
      { renderDropButton('Observation')} 
      { renderExportButton('Observations')} 
      { renderExportCheckmark(exportMethods.toggleObservationsExport.bind(this), 'Observation') }
    </TableRow>
  }

  let organizationsRow;
  if(determineRowVisible("Organization")){
    shouldDisplayNoDataRow = false;
    organizationsRow = <TableRow className='dataManagementRow'  hover={true}>
      { renderIcon("Organization") }
      { renderImportCheckmark(methods.toggleOrganizations.bind(this), 'Organization') }
      { renderImportButton('Organizations')} 
      <TableCell className="collection">Organizations</TableCell>
      { renderPreview('Organization')} 
      { renderClientCount('Organization')} 
      { renderLocalClientCount('Organization')} 
      { renderPubSub('Organization')} 
      { renderDropButton('Organization')} 
      { renderExportButton('Organizations')} 
      { renderExportCheckmark(exportMethods.toggleOrganizationsExport.bind(this), 'Organization') }
    </TableRow>
  }

  let organizationAffiliationsRow;
  if(determineRowVisible("OrganizationAffiliation")){
    shouldDisplayNoDataRow = false;
    organizationAffiliationsRow = <TableRow className='dataManagementRow'  hover={true}>
      { renderIcon("OrganizationAffiliation") }
      { renderImportCheckmark(methods.toggleOrganizationAffiliations.bind(this), 'OrganizationAffiliation') }
      { renderImportButton('OrganizationAffiliations')} 
      <TableCell className="collection">OrganizationAffiliations</TableCell>
      { renderPreview('OrganizationAffiliation')} 
      { renderClientCount('OrganizationAffiliation')} 
      { renderLocalClientCount('OrganizationAffiliation')} 
      { renderPubSub('OrganizationAffiliation')} 
      { renderDropButton('OrganizationAffiliation')} 
      { renderExportButton('OrganizationAffiliations')} 
      { renderExportCheckmark(exportMethods.toggleOrganizationAffiliationsExport.bind(this), 'OrganizationAffiliation') }
    </TableRow>
  }

  let patientsRow;
  if(determineRowVisible("Patient")){
    shouldDisplayNoDataRow = false;
    patientsRow = <TableRow className='dataManagementRow'  hover={true}>
      { renderIcon("Patient") }
      { renderImportCheckmark(methods.togglePatients.bind(this), 'Patient') }
      { renderImportButton('Patients')} 
      <TableCell className="collection">Patients</TableCell>
      { renderPreview('Patient')} 
      { renderClientCount('Patient')} 
      { renderLocalClientCount('Patient')} 
      { renderPubSub('Patient')} 
      { renderDropButton('Patient')} 
      { renderExportButton('Patients')} 
      { renderExportCheckmark(exportMethods.togglePatientsExport.bind(this), 'Patient') }
    </TableRow>
  }

  let personsRow;
  if(determineRowVisible("Person")){
    shouldDisplayNoDataRow = false;
    personsRow = <TableRow className='dataManagementRow'  hover={true}>
      { renderIcon("Person") }
      { renderImportCheckmark(methods.togglePersons.bind(this), 'Person') }
      { renderImportButton('Persons')} 
      <TableCell className="collection">Persons</TableCell>
      { renderPreview('Person')} 
      { renderClientCount('Person')} 
      { renderLocalClientCount('Person')} 
      { renderPubSub('Person')} 
      { renderDropButton('Person')} 
      { renderExportButton('Persons')} 
      { renderExportCheckmark(exportMethods.togglePersonsExport.bind(this), 'Person') }
    </TableRow>
  }

  let practitionersRow;
  if(determineRowVisible("Practitioner")){
    shouldDisplayNoDataRow = false;
    practitionersRow = <TableRow className='dataManagementRow'  hover={true}>
      { renderIcon("Practitioner") }
      { renderImportCheckmark(methods.togglePractitioners.bind(this), 'Practitioner') }
      { renderImportButton('Practitioners')} 
      <TableCell className="collection">Practitioners</TableCell>
      { renderPreview('Practitioner')} 
      { renderClientCount('Practitioner')} 
      { renderLocalClientCount('Practitioner')} 
      { renderPubSub('Practitioner')} 
      { renderDropButton('Practitioner')} 
      { renderExportButton('Practitioners')} 
      { renderExportCheckmark(exportMethods.togglePractitionersExport.bind(this), 'Practitioner') }
    </TableRow>
  }

  let practitionerRolesRow;
  if(determineRowVisible("PractitionerRole")){
    shouldDisplayNoDataRow = false;
    practitionerRolesRow = <TableRow className='dataManagementRow'  hover={true}>
      { renderIcon("PractitionerRole") }
      { renderImportCheckmark(methods.togglePractitionerRoles.bind(this), 'PractitionerRole') }
      { renderImportButton('PractitionerRoles')} 
      <TableCell className="collection">PractitionerRoles</TableCell>
      { renderPreview('PractitionerRole')} 
      { renderClientCount('PractitionerRole')} 
      { renderLocalClientCount('PractitionerRole')} 
      { renderPubSub('PractitionerRole')} 
      { renderDropButton('PractitionerRole')} 
      { renderExportButton('PractitionerRoles')} 
      { renderExportCheckmark(exportMethods.togglePractitionerRolesExport.bind(this), 'PractitionerRole') }
    </TableRow>
  }

  let proceduresRow;
  if(determineRowVisible("Procedure")){
    shouldDisplayNoDataRow = false;
    proceduresRow = <TableRow className='dataManagementRow'  hover={true}>
      { renderIcon("Procedure") }
      { renderImportCheckmark(methods.toggleProcedures.bind(this), 'Procedure') }
      { renderImportButton('Procedures')} 
      <TableCell className="collection">Procedures</TableCell>
      { renderPreview('Procedure')} 
      { renderClientCount('Procedure')} 
      { renderLocalClientCount('Procedure')} 
      { renderPubSub('Procedure')} 
      { renderDropButton('Procedure')} 
      { renderExportButton('Procedures')} 
      { renderExportCheckmark(exportMethods.toggleProceduresExport.bind(this), 'Procedure') }
    </TableRow>
  }

  let procedureRequetsRow;
  if(determineRowVisible("ProcedureRequets")){
    shouldDisplayNoDataRow = false;
    procedureRequetsRow = <TableRow className='dataManagementRow'  hover={true}>
      { renderIcon("ProcedureRequest") }
      { renderImportCheckmark(methods.toggleProcedureRequests.bind(this), 'ProcedureRequest') }
      { renderImportButton('ProcedureRequests')} 
      <TableCell className="collection">ProcedureRequests</TableCell>
      { renderPreview('ProcedureRequest')} 
      { renderClientCount('ProcedureRequest')} 
      { renderLocalClientCount('ProcedureRequest')} 
      { renderPubSub('ProcedureRequest')} 
      { renderDropButton('ProcedureRequest')} 
      { renderExportButton('ProcedureRequests')} 
      { renderExportCheckmark(exportMethods.toggleProcedureRequestsExport.bind(this), 'ProcedureRequest') }
    </TableRow>
  }
  let provenancesRow;
  if(determineRowVisible("Provenance")){
    shouldDisplayNoDataRow = false;
    provenancesRow = <TableRow className='dataManagementRow'  hover={true}>
      { renderIcon("Provenance") }
      { renderImportCheckmark(methods.toggleProvenances.bind(this), 'Provenance') }
      { renderImportButton('Provenances')} 
      <TableCell className="collection">Provenances</TableCell>
      { renderPreview('Provenance')} 
      { renderClientCount('Provenance')} 
      { renderLocalClientCount('Provenance')} 
      { renderPubSub('Provenance')} 
      { renderDropButton('Provenance')} 
      { renderExportButton('Provenances')} 
      { renderExportCheckmark(exportMethods.toggleProvenancesExport.bind(this), 'Provenance') }
    </TableRow>
  }
  let questionnairesRow;
  if(determineRowVisible("Questionnaire")){
    shouldDisplayNoDataRow = false;
    questionnairesRow = <TableRow className='dataManagementRow'  hover={true}>
      { renderIcon("Questionnaire") }
      { renderImportCheckmark(methods.toggleQuestionnaires.bind(this), 'Questionnaire') }
      { renderImportButton('Questionnaires')} 
      <TableCell className="collection">Questionnaires</TableCell>
      { renderPreview('Questionnaire')} 
      { renderClientCount('Questionnaire')} 
      { renderLocalClientCount('Questionnaire')} 
      { renderPubSub('Questionnaire')} 
      { renderDropButton('Questionnaire')} 
      { renderExportButton('Questionnaires')} 
      { renderExportCheckmark(exportMethods.toggleQuestionnairesExport.bind(this), 'Questionnaire') }
    </TableRow>
  }

  let questionnaireResponsesRow;
  if(determineRowVisible("QuestionnaireResponse")){
    shouldDisplayNoDataRow = false;
    questionnaireResponsesRow = <TableRow className='dataManagementRow'  hover={true}>
      { renderIcon("QuestionnaireResponse") }
      { renderImportCheckmark(methods.toggleQuestionnaires.bind(this), 'QuestionnaireResponse') }
      { renderImportButton('QuestionnaireResponses')} 
      <TableCell className="collection">Questionnaire Responses</TableCell>
      { renderPreview('QuestionnaireResponse')} 
      { renderClientCount('QuestionnaireResponse')} 
      { renderLocalClientCount('QuestionnaireResponse')} 
      { renderPubSub('QuestionnaireResponse')} 
      { renderDropButton('QuestionnaireResponse')} 
      { renderExportButton('QuestionnaireResponses')} 
      { renderExportCheckmark(exportMethods.toggleQuestionnaireResponsesExport.bind(this), 'QuestionnaireResponse') }
    </TableRow>
  }

  let restrictionsRow;
  if(determineRowVisible("Restriction")){
    shouldDisplayNoDataRow = false;
    restrictionsRow = <TableRow className='dataManagementRow'  hover={true}>
      { renderIcon("Restriction") }
      { renderImportCheckmark(methods.toggleRestrictions.bind(this), 'Restriction') }
      { renderImportButton('Restrictions')} 
      <TableCell className="collection">Restrictions</TableCell>
      { renderPreview('Restriction')} 
      { renderClientCount('Restriction')} 
      { renderLocalClientCount('Restriction')} 
      { renderPubSub('Restriction')} 
      { renderDropButton('Restriction')} 
      { renderExportButton('Restrictions')} 
      { renderExportCheckmark(exportMethods.toggleRestrictionsExport.bind(this), 'Restriction') }
    </TableRow>
  }

  let relatedPersonsRow;
  if(determineRowVisible("RelatedPerson")){
    shouldDisplayNoDataRow = false;
    relatedPersonsRow = <TableRow className='dataManagementRow'  hover={true}>
      { renderIcon("RelatedPerson") }
      { renderImportCheckmark(methods.toggleRelatedPersons.bind(this), 'RelatedPerson') }
      { renderImportButton('RelatedPersons')} 
      <TableCell className="collection">Related Persons</TableCell>
      { renderPreview('RelatedPerson')} 
      { renderClientCount('RelatedPerson')} 
      { renderLocalClientCount('RelatedPerson')} 
      { renderPubSub('RelatedPerson')} 
      { renderDropButton('RelatedPerson')} 
      { renderExportButton('RelatedPersons')} 
      { renderExportCheckmark(exportMethods.toggleRelatedPersonsExport.bind(this), 'RelatedPerson') }
    </TableRow>
  }

  let riskAssessmentsRow;
  if(determineRowVisible("RiskAssessment")){
    shouldDisplayNoDataRow = false;
    riskAssessmentsRow = <TableRow className='dataManagementRow'  hover={true}>
      { renderIcon("RiskAssessment") }
      { renderImportCheckmark(methods.toggleRiskAssessments.bind(this), 'RiskAssessment') }
      { renderImportButton('RiskAssessments')} 
      <TableCell className="collection">Risk Assessments</TableCell>
      { renderPreview('RiskAssessment')} 
      { renderClientCount('RiskAssessment')} 
      { renderLocalClientCount('RiskAssessment')} 
      { renderPubSub('RiskAssessment')} 
      { renderDropButton('RiskAssessment')} 
      { renderExportButton('RiskAssessments')} 
      { renderExportCheckmark(exportMethods.toggleRiskAssessmentsExport.bind(this), 'RiskAssessment') }
    </TableRow>
  }

  let searchParametersRow;
  if(determineRowVisible("SearchParameter")){
    shouldDisplayNoDataRow = false;
    searchParametersRow = <TableRow className='dataManagementRow'  hover={true}>
      { renderIcon("SearchParameter") }
      { renderImportCheckmark(methods.toggleSearchParameters.bind(this), 'SearchParameter') }
      { renderImportButton('SearchParameters')} 
      <TableCell className="collection">SearchParameters</TableCell>
      { renderPreview('SearchParameter')} 
      { renderClientCount('SearchParameter')} 
      { renderLocalClientCount('SearchParameter')} 
      { renderPubSub('SearchParameter')} 
      { renderDropButton('SearchParameter')} 
      { renderExportButton('SearchParameters')} 
      { renderExportCheckmark(exportMethods.toggleSearchParametersExport.bind(this), 'SearchParameter') }
    </TableRow>
  }


  let schedulesRow;
  if(determineRowVisible("Schedule")){
    shouldDisplayNoDataRow = false;
    schedulesRow = <TableRow className='dataManagementRow'  hover={true}>
      { renderIcon("Schedule") }
      { renderImportCheckmark(methods.toggleSchedules.bind(this), 'Schedule') }
      { renderImportButton('Schedules')} 
      <TableCell className="collection">Schedules</TableCell>
      { renderPreview('Schedule')} 
      { renderClientCount('Schedule')} 
      { renderLocalClientCount('Schedule')} 
      { renderPubSub('Schedule')} 
      { renderDropButton('Schedule')} 
      { renderExportButton('Schedules')} 
      { renderExportCheckmark(exportMethods.toggleSchedulesExport.bind(this), 'Schedule') }
    </TableRow>
  }

  let serviceRequestsRow;
  if(determineRowVisible("ServiceRequest")){
    shouldDisplayNoDataRow = false;
    serviceRequestsRow = <TableRow className='dataManagementRow'  hover={true}>
      { renderIcon("ServiceRequest") }
      { renderImportCheckmark(methods.toggleServiceRequests.bind(this), 'ServiceRequest') }
      { renderImportButton('ServiceRequests')} 
      <TableCell className="collection">Service Requests</TableCell>
      { renderPreview('ServiceRequest')} 
      { renderClientCount('ServiceRequest')} 
      { renderLocalClientCount('ServiceRequest')} 
      { renderPubSub('ServiceRequest')} 
      { renderDropButton('ServiceRequest')} 
      { renderExportButton('ServiceRequests')} 
      { renderExportCheckmark(exportMethods.toggleServiceRequestsExport.bind(this), 'ServiceRequest') }
    </TableRow>
  }

  let sequencesRow;
  if(determineRowVisible("Sequence")){
    shouldDisplayNoDataRow = false;
    sequencesRow = <TableRow className='dataManagementRow'  hover={true}>
      { renderIcon("Sequence") }
      { renderImportCheckmark(methods.toggleSequences.bind(this), 'Sequence') }
      { renderImportButton('Sequences')} 
      <TableCell className="collection">Sequences</TableCell>
      { renderPreview('Sequence')} 
      { renderClientCount('Sequence')} 
      { renderLocalClientCount('Sequence')} 
      { renderPubSub('Sequence')} 
      { renderDropButton('Sequence')} 
      { renderExportButton('Sequences')} 
      { renderExportCheckmark(exportMethods.toggleSequencesExport.bind(this), 'Sequence') }
    </TableRow>     
  }

  let structureDefinitionsRow;
  if(determineRowVisible("StructureDefinition")){
    shouldDisplayNoDataRow = false;
    structureDefinitionsRow = <TableRow className='dataManagementRow'  hover={true}>
      { renderIcon("StructureDefinition") }
      { renderImportCheckmark(methods.toggleStructureDefinitions.bind(this), 'StructureDefinition') }
      { renderImportButton('StructureDefinitions')} 
      <TableCell className="collection">StructureDefinitions</TableCell>
      { renderPreview('StructureDefinition')} 
      { renderClientCount('StructureDefinition')} 
      { renderLocalClientCount('StructureDefinition')} 
      { renderPubSub('StructureDefinition')} 
      { renderDropButton('StructureDefinition')} 
      { renderExportButton('StructureDefinitions')} 
      { renderExportCheckmark(exportMethods.toggleStructureDefinitionsExport.bind(this), 'StructureDefinition') }
    </TableRow>     
  }

  let tasksRow;
  if(determineRowVisible("Task")){
    shouldDisplayNoDataRow = false;
    tasksRow = <TableRow className='dataManagementRow'  hover={true}>
      { renderIcon("Task") }
      { renderImportCheckmark(methods.toggleTasks.bind(this), 'Task') }
      { renderImportButton('Tasks')} 
      <TableCell className="collection">Tasks</TableCell>
      { renderPreview('Task')} 
      { renderClientCount('Task')} 
      { renderLocalClientCount('Task')} 
      { renderPubSub('Task')} 
      { renderDropButton('Task')} 
      { renderExportButton('Tasks')} 
      { renderExportCheckmark(exportMethods.toggleTasksExport.bind(this), 'Task') }
    </TableRow>     
  }

  let valueSetsRow;
  if(determineRowVisible("ValueSet")){
    shouldDisplayNoDataRow = false;
    valueSetsRow = <TableRow className='dataManagementRow'  hover={true}>
      { renderIcon("ValueSet") }
      { renderImportCheckmark(methods.toggleValueSets.bind(this), 'ValueSet') }
      { renderImportButton('ValueSets')} 
      <TableCell className="collection">Value Sets</TableCell>
      { renderPreview('ValueSet')} 
      { renderClientCount('ValueSet')} 
      { renderLocalClientCount('ValueSet')} 
      { renderPubSub('ValueSet')} 
      { renderDropButton('ValueSet')} 
      { renderExportButton('ValueSets')} 
      { renderExportCheckmark(exportMethods.toggleValueSetsExport.bind(this), 'ValueSet') }
    </TableRow>     
  }

  let verificationResultsRow;
  if(determineRowVisible("VerificationResult")){
    shouldDisplayNoDataRow = false;
    verificationResultsRow = <TableRow className='dataManagementRow'  hover={true}>
      { renderIcon("VerificationResult") }
      { renderImportCheckmark(methods.toggleVerificationResults.bind(this), 'VerificationResult') }
      { renderImportButton('VerificationResults')} 
      <TableCell className="collection">VerificationResults</TableCell>
      { renderPreview('VerificationResult')} 
      { renderClientCount('VerificationResult')} 
      { renderLocalClientCount('VerificationResult')} 
      { renderPubSub('VerificationResult')} 
      { renderDropButton('VerificationResult')} 
      { renderExportButton('VerificationResults')} 
      { renderExportCheckmark(exportMethods.toggleVerificationResultsExport.bind(this), 'VerificationResult') }
    </TableRow>
  }

  let contentToRender;
  if(shouldDisplayNoDataRow){
    contentToRender = <div className="helveticas" style={{textAlign: 'center', padding: '40px', width: '100%'}}>
        <h2 className="helveticas" style={{margin: '10px'}}>{props.noDataMessage}</h2>
        <h4 className="helveticas"> Maybe try importing data instead?</h4>
      </div>          
  } else {
    contentToRender = <Table id="collectionManagementTable"  size={props.tableSize} aria-label="a data management table" >
      <TableHead>
        <TableRow>
          { renderIconHeader() }
          { renderImportCheckmarkHeader()}             
          { renderImportButtonHeader()} 
          <TableCell className="collection">Collection</TableCell>
          { renderPreviewHeader()} 
          { renderClientCountHeader()} 
          { renderLocalClientCountHeader()} 
          { renderPubSubHeader()}           
          { renderDropButtonHeader()} 
          { renderExportButtonHeader()} 
          { renderExportCheckmarkHeader()}
        </TableRow>
      </TableHead>
      <TableBody>
        
        { allergyIntolerancesRow }
        { appointmentsRow }
        { bundlesRow }
        { carePlansRow } 
        { careTeamsRow }
        { claimsRow }
        { clinicalDocumentsRow }
        { clinicalImpressionsRow }
        { codeSystemsRow }
        { conditionsRow }
        { consentsRow }
        { contractsRow }
        { communicationsRow } 
        { communicationResponsesRow } 
        { communicationRequestsRow } 
        { devicesRow }
        { diagnosticReportsRow }
        { documentReferencesRow }
        { encountersRow }
        { endpointsRow }
        { explanationOfBenefitsRow }
        { familyMemberHistoriesRow }
        { goalsRow }
        { healthcareServicesRow }
        { immunizationsRow }
        { insurancePlansRow }
        { imagingStudiesRow }
        { listsRow } 
        { locationsRow }
        { measuresRow }
        { measureReportsRow }
        { medicationsRow }
        { medicationOrdersRow }
        { medicationStatementsRow }
        { messageHeadersRow }
        { networksRow }
        { observationsRow }
        { organizationsRow }
        { organizationAffiliationsRow }
        { patientsRow }
        { personsRow }
        { practitionersRow }
        { practitionerRolesRow }
        { proceduresRow }
        { procedureRequetsRow }
        { provenancesRow }
        { questionnairesRow }
        { questionnaireResponsesRow }
        { restrictionsRow }
        { relatedPersonsRow }
        { riskAssessmentsRow }
        { searchParametersRow }
        { schedulesRow }
        { serviceRequestsRow }
        { sequencesRow }          
        { structureDefinitionsRow }              
        { tasksRow }  
        { valueSetsRow }         
        { verificationResultsRow }            
      </TableBody>
    </Table>
  }



  return(
    <div style={props.style} >
      { contentToRender }
    </div>
  );

}



CollectionManagement.propTypes = {
  displayIcons: PropTypes.bool,
  displayImportCheckmarks: PropTypes.bool,
  displayExportCheckmarks: PropTypes.bool,
  displayPubSubEnabled: PropTypes.bool,
  displayClientCount: PropTypes.bool,
  displayLocalClientCount: PropTypes.bool,
  displayServerCount: PropTypes.bool,
  displayInit: PropTypes.bool,
  displayDrop: PropTypes.bool,
  displaySync: PropTypes.bool,
  displayImportButton: PropTypes.bool,
  displayExportButton: PropTypes.bool,
  displayDropButton: PropTypes.bool,
  displayPreview: PropTypes.bool,
  mode: PropTypes.string,
  exportFileType: PropTypes.string,
  resourceTypes: PropTypes.array,
  noDataMessage: PropTypes.string,
  preview: PropTypes.object,
  selectedPatientId: PropTypes.string,
  tableSize: PropTypes.string,
  onSelectionChange: PropTypes.func,
  onSelectedExportChange: PropTypes.func
}
CollectionManagement.defaultProps = {
  displayIcons: false,
  displayImportCheckmarks: false,
  displayExportCheckmarks: true,
  displayPubSubEnabled: false,
  displayClientCount: true,
  displayLocalClientCount: false,
  displayServerCount: false,
  displayInit: false,
  displayDrop: false,
  displaySync: false,
  displayImportButton: false,
  displayExportButton: true,
  displayDropButton: false,
  displayPreview: false,
  selectedPatientId: '',
  resourceTypes: ["AllergyIntolerance", "CarePlan", "Condition", "Immunization", "Medication", "MedicationStatement", "Patient", "Procedure"],
  mode: 'all',  // all, import, export, specific, additive
  exportFileType: 'json', // json, geojson, fhir, csv
  noDataMessage: "No data found.",
  preview: {},
  tableSize: 'small'
}

export default CollectionManagement;
