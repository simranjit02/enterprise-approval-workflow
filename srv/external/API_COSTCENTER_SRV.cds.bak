/* checksum : 30561c45b36d4147061a7418a3a46409 */
@cds.external : true
@CodeList.CurrencyCodes.Url : '../../../../default/iwbep/common/0001/$metadata'
@CodeList.CurrencyCodes.CollectionPath : 'Currencies'
@Common.ApplyMultiUnitBehaviorForSortingAndFiltering : true
@Capabilities.FilterFunctions : [
  'eq',
  'ne',
  'gt',
  'ge',
  'lt',
  'le',
  'and',
  'or',
  'contains',
  'startswith',
  'endswith',
  'any',
  'all'
]
@SAP__support.TechnicalInfoLinks.Url : '../../../../default/iwbep/common/0001/$metadata'
@SAP__support.TechnicalInfoLinks.FunctionImport : 'GetTechnicalInfoLinks'
@Capabilities.SupportedFormats : [ 'application/json', 'application/pdf' ]
@PDF.Features.DocumentDescriptionReference : '../../../../default/iwbep/common/0001/$metadata'
@PDF.Features.DocumentDescriptionCollection : 'MyDocumentDescriptions'
@PDF.Features.ArchiveFormat : true
@PDF.Features.Border : true
@PDF.Features.CoverPage : true
@PDF.Features.FitToPage : true
@PDF.Features.FontName : true
@PDF.Features.FontSize : true
@PDF.Features.HeaderFooter : true
@PDF.Features.IANATimezoneFormat : true
@PDF.Features.Margin : true
@PDF.Features.Padding : true
@PDF.Features.ResultSizeDefault : 20000
@PDF.Features.ResultSizeMaximum : 20000
@PDF.Features.Signature : true
@PDF.Features.TextDirectionLayout : true
@PDF.Features.Treeview : true
@PDF.Features.UploadToFileShare : true
@Capabilities.KeyAsSegmentSupported : true
@Capabilities.AsynchronousRequestsSupported : true
service API_COSTCENTER_SRV {
  @cds.external : true
  type CostCtrUpdateValidityPeriodP_Type {
    @Common.IsUpperCase : true
    @Common.Label : 'Controlling Area'
    @Common.Heading : 'COAr'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=KOKRS'
    ControllingArea : String(4) not null;
    @Common.FieldControl : #Mandatory
    @Common.IsUpperCase : true
    @Common.Label : 'Cost Center'
    @Common.Heading : 'Cost Ctr'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=KOSTL'
    CostCenter : String(10) not null;
    @Common.FieldControl : #Mandatory
    @Common.Label : 'Valid To'
    @Common.Heading : 'to'
    @Common.QuickInfo : 'Valid To Date'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=DATBI'
    ValidityEndDate : Date;
    @Common.Label : 'Valid To'
    @Common.Heading : 'to'
    @Common.QuickInfo : 'Valid To Date'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=DATBI'
    NewValidityEndDate : Date;
    @Common.Label : 'Valid From'
    @Common.QuickInfo : 'Valid-From Date'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=DATAB'
    ValidityStartDate : Date;
    @Common.Label : 'Cost Center Name'
    CostCenterName : String(20) not null;
    @Common.Label : 'Cost Center Desc.'
    @Common.Heading : 'CoCtr'
    @Common.QuickInfo : 'Description of Cost Center'
    CostCenterDescription : String(40) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Lock Primary Costs Posting'
    @Common.QuickInfo : 'Lock Indicator for Actual Primary Postings'
    IsBlkdForPrimaryCostsPosting : Boolean not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Company Code'
    @Common.Heading : 'CoCd'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=BUKRS'
    CompanyCode : String(4) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Cost Center Category'
    @Common.Heading : 'CCtC'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=KOSAR'
    CostCenterCategory : String(1) not null;
    @Common.Label : 'Person Responsible'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=VERAK'
    CostCtrResponsiblePersonName : String(20) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'User Responsible'
    @Common.Heading : 'User Resp.'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=VERAK_USER'
    CostCtrResponsibleUser : String(12) not null;
    @Common.IsCurrency : true
    @Common.IsUpperCase : true
    @Common.Label : 'Currency'
    @Common.Heading : 'Crcy'
    @Common.QuickInfo : 'Currency Key'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=WAERS'
    CostCenterCurrency : String(3) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Tax Jurisdiction'
    @Common.Heading : 'Tax Jur.'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=TXJCD'
    TaxJurisdiction : String(15) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Profit Center'
    @Common.Heading : 'Profit Ctr'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=PRCTR'
    ProfitCenter : String(10) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Logical System'
    @Common.Heading : 'Log.System'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=LOGSYSTEM'
    LogicalSystem : String(10) not null;
    @Common.Label : 'Created On'
    CostCenterCreationDate : Date;
    @Common.IsUpperCase : true
    @Common.Label : 'Created By'
    CostCenterCreatedByUser : String(12) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Lock Secondary Costs Posting'
    @Common.QuickInfo : 'Lock Indicator for Actual Secondary Costs'
    IsBlkdForSecondaryCostsPosting : Boolean not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Lock Revenue Posting'
    @Common.QuickInfo : 'Lock Indicator for Actual Revenue Postings'
    IsBlockedForRevenuePosting : Boolean not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Lock Commitment Updates'
    @Common.QuickInfo : 'Lock Indicator for Commitment Update'
    IsBlockedForCommitmentPosting : Boolean not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Record Quantity'
    @Common.Heading : 'Qty'
    @Common.QuickInfo : 'Indicator for Recording Consumption Quantities'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=MGEFL'
    ConsumptionQtyIsRecorded : Boolean not null;
    @Common.Label : 'Department'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=ABTEI'
    Department : String(12) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Country/Region'
    @Common.Heading : 'Ctry/Reg.'
    Country : String(3) not null;
    @Common.Label : 'Title'
    FormOfAddress : String(15) not null;
    @Common.Label : 'Address Name'
    @Common.QuickInfo : 'Address name'
    AddressName : String(35) not null;
    @Common.Label : 'City'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=ORT01_GP'
    CityName : String(35) not null;
    @Common.Label : 'District'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=ORT02_GP'
    District : String(35) not null;
    @Common.Label : 'District'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=ORT02_GP'
    StreetAddressName : String(35) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'PO Box'
    POBox : String(10) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Postal Code'
    @Common.Heading : 'PostalCode'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=PSTLZ'
    PostalCode : String(10) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'PO Box Postal Code'
    @Common.Heading : 'PO Box PCD'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=PSTL2'
    POBoxPostalCode : String(10) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Region'
    @Common.Heading : 'Rg'
    @Common.QuickInfo : 'Region (State, Province, County)'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REGIO'
    Region : String(3) not null;
    @Common.Label : 'Language Key'
    @Common.Heading : 'Language'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=SPRAS'
    Language : String(2) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Phone'
    PhoneNumber1 : String(16) not null;
    @Common.Label : 'Fax Number'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=TELFX'
    FaxNumber : String(31) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Printer Destination'
    @Common.QuickInfo : 'Printer destination for CCtr report'
    CostCenterPrinterDestination : String(4) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Standard Hierarchy Node'
    @Common.QuickInfo : 'Cost Center Hierarchy'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=FCO_CC_KHINR'
    CostCenterStandardHierArea : String(12) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Functional Area'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=FKBER'
    FunctionalArea : String(16) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Joint Venture'
    @Common.Heading : 'JV'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=JV_NAME'
    JointVenture : String(6) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Recovery Indicator'
    @Common.Heading : 'RI'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=JV_RECIND'
    JointVentureRecoveryCode : String(2) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Equity Type'
    @Common.Heading : 'ET'
    JointVentureEquityType : String(3) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'JV Object Type'
    @Common.Heading : 'Type'
    @Common.QuickInfo : 'Joint Venture Object Type'
    JointVentureObjectType : String(4) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'JIB/JIBE Class'
    @Common.Heading : 'Class'
    JointVentureClass : String(3) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'JIB/JIBE Subclass A'
    @Common.Heading : 'SCl A'
    JointVentureSubClass : String(5) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Budget-Carrying Cost Center'
    BudgetCarryingCostCenter : String(10) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Budget Availability Control Profile'
    AvailabilityControlProfile : String(6) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Budget Availability Control is Active'
    AvailabilityControlIsActive : Boolean not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Fund'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=BP_GEBER'
    Fund : String(10) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Grant'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=GM_GRANT_NBR'
    GrantID : String(20) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Fund Fixed Assignment'
    @Common.QuickInfo : 'Indicator for Fund with Fixed Assignment'
    FundIsFixAssigned : Boolean not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Grant Fixed Assignment'
    @Common.QuickInfo : 'Indicator for Grant with Fixed Assignment'
    GrantIDIsFixAssigned : Boolean not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Functional Area Fixed Assignment'
    @Common.QuickInfo : 'Indicator for Functional Area with Fixed Assignment'
    FunctionalAreaIsFixAssigned : Boolean not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Is Budget Carrying'
    @Common.QuickInfo : 'Indicator, if cost center is budget carrying'
    CostCenterIsBudgetCarrying : Boolean not null;
    @Common.Label : 'Created At'
    CostCenterCreationTime : Time not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Last Changed By'
    CostCenterLastChangedByUser : String(12) not null;
    @Common.Label : 'Last Changed On'
    CostCenterLastChangedOnDate : Date;
    @Common.Label : 'Last Changed At'
    CostCenterLastChangedAtTime : Time not null;
    _CostCenterText : many D_CostCtrUpdtValdtyPeriodTxtP not null;
  };

  @cds.external : true
  type CostCtrCreateValidityPeriodP_Type {
    @Common.IsUpperCase : true
    @Common.Label : 'Controlling Area'
    @Common.Heading : 'COAr'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=KOKRS'
    ControllingArea : String(4) not null;
    @Common.FieldControl : #Mandatory
    @Common.IsUpperCase : true
    @Common.Label : 'Cost Center'
    @Common.Heading : 'Cost Ctr'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=KOSTL'
    CostCenter : String(10) not null;
    @Common.FieldControl : #Mandatory
    @Common.Label : 'Valid To'
    @Common.Heading : 'to'
    @Common.QuickInfo : 'Valid To Date'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=DATBI'
    ValidityEndDate : Date;
    @Common.FieldControl : #Mandatory
    @Common.Label : 'Valid From'
    @Common.QuickInfo : 'Valid-From Date'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=DATAB'
    ValidityStartDate : Date;
    @Common.FieldControl : #Mandatory
    @Common.Label : 'Cost Center Name'
    CostCenterName : String(20) not null;
    @Common.FieldControl : #Mandatory
    @Common.Label : 'Cost Center Desc.'
    @Common.Heading : 'CoCtr'
    @Common.QuickInfo : 'Description of Cost Center'
    CostCenterDescription : String(40) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Lock Primary Costs Posting'
    @Common.QuickInfo : 'Lock Indicator for Actual Primary Postings'
    IsBlkdForPrimaryCostsPosting : Boolean not null;
    @Common.FieldControl : #Mandatory
    @Common.IsUpperCase : true
    @Common.Label : 'Company Code'
    @Common.Heading : 'CoCd'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=BUKRS'
    CompanyCode : String(4) not null;
    @Common.FieldControl : #Mandatory
    @Common.IsUpperCase : true
    @Common.Label : 'Cost Center Category'
    @Common.Heading : 'CCtC'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=KOSAR'
    CostCenterCategory : String(1) not null;
    @Common.FieldControl : #Mandatory
    @Common.Label : 'Person Responsible'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=VERAK'
    CostCtrResponsiblePersonName : String(20) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'User Responsible'
    @Common.Heading : 'User Resp.'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=VERAK_USER'
    CostCtrResponsibleUser : String(12) not null;
    @Common.IsCurrency : true
    @Common.IsUpperCase : true
    @Common.Label : 'Currency'
    @Common.Heading : 'Crcy'
    @Common.QuickInfo : 'Currency Key'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=WAERS'
    CostCenterCurrency : String(3) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Tax Jurisdiction'
    @Common.Heading : 'Tax Jur.'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=TXJCD'
    TaxJurisdiction : String(15) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Profit Center'
    @Common.Heading : 'Profit Ctr'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=PRCTR'
    ProfitCenter : String(10) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Logical System'
    @Common.Heading : 'Log.System'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=LOGSYSTEM'
    LogicalSystem : String(10) not null;
    @Common.Label : 'Created On'
    CostCenterCreationDate : Date;
    @Common.IsUpperCase : true
    @Common.Label : 'Created By'
    CostCenterCreatedByUser : String(12) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Lock Secondary Costs Posting'
    @Common.QuickInfo : 'Lock Indicator for Actual Secondary Costs'
    IsBlkdForSecondaryCostsPosting : Boolean not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Lock Revenue Posting'
    @Common.QuickInfo : 'Lock Indicator for Actual Revenue Postings'
    IsBlockedForRevenuePosting : Boolean not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Lock Commitment Updates'
    @Common.QuickInfo : 'Lock Indicator for Commitment Update'
    IsBlockedForCommitmentPosting : Boolean not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Record Quantity'
    @Common.Heading : 'Qty'
    @Common.QuickInfo : 'Indicator for Recording Consumption Quantities'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=MGEFL'
    ConsumptionQtyIsRecorded : Boolean not null;
    @Common.Label : 'Department'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=ABTEI'
    Department : String(12) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Country/Region'
    @Common.Heading : 'Ctry/Reg.'
    Country : String(3) not null;
    @Common.Label : 'Title'
    FormOfAddress : String(15) not null;
    @Common.Label : 'Address Name'
    @Common.QuickInfo : 'Address name'
    AddressName : String(35) not null;
    @Common.Label : 'City'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=ORT01_GP'
    CityName : String(35) not null;
    @Common.Label : 'District'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=ORT02_GP'
    District : String(35) not null;
    @Common.Label : 'District'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=ORT02_GP'
    StreetAddressName : String(35) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'PO Box'
    POBox : String(10) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Postal Code'
    @Common.Heading : 'PostalCode'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=PSTLZ'
    PostalCode : String(10) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'PO Box Postal Code'
    @Common.Heading : 'PO Box PCD'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=PSTL2'
    POBoxPostalCode : String(10) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Region'
    @Common.Heading : 'Rg'
    @Common.QuickInfo : 'Region (State, Province, County)'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REGIO'
    Region : String(3) not null;
    @Common.Label : 'Language Key'
    @Common.Heading : 'Language'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=SPRAS'
    Language : String(2) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Phone'
    PhoneNumber1 : String(16) not null;
    @Common.Label : 'Fax Number'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=TELFX'
    FaxNumber : String(31) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Printer Destination'
    @Common.QuickInfo : 'Printer destination for CCtr report'
    CostCenterPrinterDestination : String(4) not null;
    @Common.FieldControl : #Mandatory
    @Common.IsUpperCase : true
    @Common.Label : 'Standard Hierarchy Node'
    @Common.QuickInfo : 'Cost Center Hierarchy'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=FCO_CC_KHINR'
    CostCenterStandardHierArea : String(12) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Functional Area'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=FKBER'
    FunctionalArea : String(16) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Joint Venture'
    @Common.Heading : 'JV'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=JV_NAME'
    JointVenture : String(6) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Recovery Indicator'
    @Common.Heading : 'RI'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=JV_RECIND'
    JointVentureRecoveryCode : String(2) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Equity Type'
    @Common.Heading : 'ET'
    JointVentureEquityType : String(3) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'JV Object Type'
    @Common.Heading : 'Type'
    @Common.QuickInfo : 'Joint Venture Object Type'
    JointVentureObjectType : String(4) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'JIB/JIBE Class'
    @Common.Heading : 'Class'
    JointVentureClass : String(3) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'JIB/JIBE Subclass A'
    @Common.Heading : 'SCl A'
    JointVentureSubClass : String(5) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Budget-Carrying Cost Center'
    BudgetCarryingCostCenter : String(10) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Budget Availability Control Profile'
    AvailabilityControlProfile : String(6) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Budget Availability Control is Active'
    AvailabilityControlIsActive : Boolean not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Fund'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=BP_GEBER'
    Fund : String(10) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Grant'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=GM_GRANT_NBR'
    GrantID : String(20) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Fund Fixed Assignment'
    @Common.QuickInfo : 'Indicator for Fund with Fixed Assignment'
    FundIsFixAssigned : Boolean not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Grant Fixed Assignment'
    @Common.QuickInfo : 'Indicator for Grant with Fixed Assignment'
    GrantIDIsFixAssigned : Boolean not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Functional Area Fixed Assignment'
    @Common.QuickInfo : 'Indicator for Functional Area with Fixed Assignment'
    FunctionalAreaIsFixAssigned : Boolean not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Is Budget Carrying'
    @Common.QuickInfo : 'Indicator, if cost center is budget carrying'
    CostCenterIsBudgetCarrying : Boolean not null;
    @Common.Label : 'Created At'
    CostCenterCreationTime : Time not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Last Changed By'
    CostCenterLastChangedByUser : String(12) not null;
    @Common.Label : 'Last Changed On'
    CostCenterLastChangedOnDate : Date;
    @Common.Label : 'Last Changed At'
    CostCenterLastChangedAtTime : Time not null;
    _CostCenterText : many D_CostCtrCrteValdtyPeriodTxtP not null;
  };

  @cds.external : true
  type D_CostCtrCrteValdtyPeriodTxtP {
    @Common.FieldControl : #Mandatory
    @Common.Label : 'Language Key'
    @Common.Heading : 'Language'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=SPRAS'
    Language : String(2) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Controlling Area'
    @Common.Heading : 'COAr'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=KOKRS'
    ControllingArea : String(4) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Cost Center'
    @Common.Heading : 'Cost Ctr'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=KOSTL'
    CostCenter : String(10) not null;
    @Common.Label : 'Valid To'
    @Common.Heading : 'to'
    @Common.QuickInfo : 'Valid To Date'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=DATBI'
    ValidityEndDate : Date;
    @Common.Label : 'Cost Center Name'
    CostCenterName : String(20) not null;
    @Common.Label : 'Cost Center Desc.'
    @Common.Heading : 'CoCtr'
    @Common.QuickInfo : 'Description of Cost Center'
    CostCenterDescription : String(40) not null;
  };

  @cds.external : true
  type D_CostCtrUpdtValdtyPeriodTxtP {
    @Common.FieldControl : #Mandatory
    @Common.Label : 'Language Key'
    @Common.Heading : 'Language'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=SPRAS'
    Language : String(2) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Controlling Area'
    @Common.Heading : 'COAr'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=KOKRS'
    ControllingArea : String(4) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Cost Center'
    @Common.Heading : 'Cost Ctr'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=KOSTL'
    CostCenter : String(10) not null;
    @Common.Label : 'Valid To'
    @Common.Heading : 'to'
    @Common.QuickInfo : 'Valid To Date'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=DATBI'
    ValidityEndDate : Date;
    @Common.Label : 'Cost Center Name'
    CostCenterName : String(20) not null;
    @Common.Label : 'Cost Center Desc.'
    @Common.Heading : 'CoCtr'
    @Common.QuickInfo : 'Description of Cost Center'
    CostCenterDescription : String(40) not null;
  };

  @cds.external : true
  type SAP__Message {
    code : String not null;
    message : String not null;
    target : String;
    additionalTargets : many String not null;
    transition : Boolean not null;
    @odata.Type : 'Edm.Byte'
    numericSeverity : Integer not null;
    longtextUrl : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @Common.Label : 'Cost Center Text'
  @Common.SAPObjectNodeType.Name : 'CostCenterText'
  @Common.Messages : SAP__Messages
  @Capabilities.NavigationRestrictions.RestrictedProperties : [
    {
      NavigationProperty: _CostCenter,
      InsertRestrictions: { Insertable: false },
      DeepUpdateSupport: { Supported: false }
    }
  ]
  @Capabilities.SearchRestrictions.Searchable : false
  @Capabilities.UpdateRestrictions.DeltaUpdateSupported : true
  @Capabilities.UpdateRestrictions.NonUpdatableNavigationProperties : [ '_CostCenter' ]
  @Capabilities.UpdateRestrictions.QueryOptions.SelectSupported : true
  @Capabilities.DeepUpdateSupport.ContentIDSupported : true
  @Capabilities.InsertRestrictions.Insertable : false
  entity A_CostCenterText_2 {
    @Core.ComputedDefaultValue : true
    @Common.Label : 'Language Key'
    @Common.Heading : 'Language'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=SPRAS'
    key Language : String(2) not null;
    @Core.ComputedDefaultValue : true
    @Common.IsUpperCase : true
    @Common.Label : 'Controlling Area'
    @Common.Heading : 'COAr'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=KOKRS'
    key ControllingArea : String(4) not null;
    @Core.ComputedDefaultValue : true
    @Common.IsUpperCase : true
    @Common.Label : 'Cost Center'
    @Common.Heading : 'Cost Ctr'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=KOSTL'
    key CostCenter : String(10) not null;
    @Core.ComputedDefaultValue : true
    @Common.Label : 'Valid To'
    @Common.Heading : 'to'
    @Common.QuickInfo : 'Valid To Date'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=DATBI'
    key ValidityEndDate : Date not null;
    @Common.Label : 'Cost Center Name'
    CostCenterName : String(20) not null;
    @Common.Label : 'Cost Center Description'
    CostCenterDescription : String(40) not null;
    SAP__Messages : many SAP__Message not null;
    _CostCenter : Association to one A_CostCenter_2 on _CostCenter.ValidityEndDate = ValidityEndDate;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @Common.Label : 'Cost Center'
  @Common.SAPObjectNodeType.Name : 'CostCenter'
  @ODM.entityName : 'CostCenter'
  @Common.Messages : SAP__Messages
  @Capabilities.NavigationRestrictions.RestrictedProperties : [
    {
      NavigationProperty: _CostCenterText,
      InsertRestrictions: { Insertable: true }
    }
  ]
  @Capabilities.SearchRestrictions.Searchable : false
  @Capabilities.UpdateRestrictions.DeltaUpdateSupported : true
  @Capabilities.UpdateRestrictions.NonUpdatableNavigationProperties : [ '_CostCenterText' ]
  @Capabilities.UpdateRestrictions.QueryOptions.SelectSupported : true
  @Capabilities.DeepUpdateSupport.ContentIDSupported : true
  entity A_CostCenter_2 {
    @Core.Computed : true
    @Common.IsUpperCase : true
    @Common.Label : 'Controlling Area'
    @Common.Heading : 'COAr'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=KOKRS'
    key ControllingArea : String(4) not null;
    @Core.Computed : true
    @Common.IsUpperCase : true
    @Common.Label : 'Cost Center'
    @Common.Heading : 'Cost Ctr'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=KOSTL'
    key CostCenter : String(10) not null;
    @Core.ComputedDefaultValue : true
    @Common.Label : 'Valid To'
    @Common.Heading : 'to'
    @Common.QuickInfo : 'Valid To Date'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=DATBI'
    key ValidityEndDate : Date not null;
    @Common.FieldControl : #Mandatory
    @Common.Label : 'Valid From'
    @Common.QuickInfo : 'Valid-From Date'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=DATAB'
    ValidityStartDate : Date;
    @Common.FieldControl : #Mandatory
    @Common.Label : 'Cost Center Name'
    CostCenterName : String(20) not null;
    @Common.FieldControl : #Mandatory
    @Common.Label : 'Cost Center Desc.'
    @Common.Heading : 'CoCtr'
    @Common.QuickInfo : 'Description of Cost Center'
    CostCenterDescription : String(40) not null;
    @Common.Label : 'Lock Primary Costs Posting'
    @Common.QuickInfo : 'Lock Indicator for Actual Primary Postings'
    IsBlkdForPrimaryCostsPosting : Boolean not null;
    @Common.Label : 'Lock Primary Costs Planning'
    @Common.QuickInfo : 'Lock Indicator for Plan Primary Costs'
    IsBlockedForPlanPrimaryCosts : Boolean not null;
    @Common.FieldControl : #Mandatory
    @Common.IsUpperCase : true
    @Common.Label : 'Company Code'
    @Common.Heading : 'CoCd'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=BUKRS'
    CompanyCode : String(4) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Business Area'
    @Common.Heading : 'BusA'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=GSBER'
    BusinessArea : String(4) not null;
    @Common.FieldControl : #Mandatory
    @Common.IsUpperCase : true
    @Common.Label : 'Cost Center Category'
    @Common.Heading : 'CCtC'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=KOSAR'
    CostCenterCategory : String(1) not null;
    @Common.FieldControl : #Mandatory
    @Common.Label : 'Person Responsible'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=VERAK'
    CostCtrResponsiblePersonName : String(20) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'User Responsible'
    @Common.Heading : 'User Resp.'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=VERAK_USER'
    CostCtrResponsibleUser : String(12) not null;
    @Common.IsCurrency : true
    @Common.IsUpperCase : true
    @Common.Label : 'Currency'
    @Common.Heading : 'Crcy'
    @Common.QuickInfo : 'Currency Key'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=WAERS'
    CostCenterCurrency : String(3) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Costing Sheet'
    @Common.Heading : 'CostSh'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=AUFKALSM'
    CostingSheet : String(6) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Tax Jurisdiction'
    @Common.Heading : 'Tax Jur.'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=TXJCD'
    TaxJurisdiction : String(15) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Profit Center'
    @Common.Heading : 'Profit Ctr'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=PRCTR'
    ProfitCenter : String(10) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Plant'
    @Common.Heading : 'Plnt'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=WERKS_D'
    Plant : String(4) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Logical System'
    @Common.Heading : 'Log.System'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=LOGSYSTEM'
    LogicalSystem : String(10) not null;
    @Common.Label : 'Created On'
    CostCenterCreationDate : Date;
    @Common.IsUpperCase : true
    @Common.Label : 'Created By'
    CostCenterCreatedByUser : String(12) not null;
    @Common.Label : 'Lock Secondary Costs Posting'
    @Common.QuickInfo : 'Lock Indicator for Actual Secondary Costs'
    IsBlkdForSecondaryCostsPosting : Boolean not null;
    @Common.Label : 'Lock Revenue Posting'
    @Common.QuickInfo : 'Lock Indicator for Actual Revenue Postings'
    IsBlockedForRevenuePosting : Boolean not null;
    @Common.Label : 'Lock Commitment Updates'
    @Common.QuickInfo : 'Lock Indicator for Commitment Update'
    IsBlockedForCommitmentPosting : Boolean not null;
    @Common.Label : 'Lock Secondary Costs Planning'
    @Common.QuickInfo : 'Lock Indicator for Plan Secondary Costs'
    IsBlockedForPlanSecondaryCosts : Boolean not null;
    @Common.Label : 'Lock Revenue Planning'
    @Common.QuickInfo : 'Lock Indicator for Planning Revenues'
    IsBlockedForPlanRevenues : Boolean not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Allocation Methods'
    @Common.Heading : 'AM'
    @Common.QuickInfo : 'Indicator for Allowed Allocation Methods'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=VMETH'
    CostCenterAllocationMethod : String(2) not null;
    @Common.Label : 'Record Quantity'
    @Common.Heading : 'Qty'
    @Common.QuickInfo : 'Indicator for Recording Consumption Quantities'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=MGEFL'
    ConsumptionQtyIsRecorded : Boolean not null;
    @Common.Label : 'Department'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=ABTEI'
    Department : String(12) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Country/Region'
    @Common.Heading : 'Ctry/Reg.'
    Country : String(3) not null;
    @Common.Label : 'Title'
    FormOfAddress : String(15) not null;
    @Common.Label : 'Address Name'
    @Common.QuickInfo : 'Address name'
    AddressName : String(35) not null;
    @Common.Label : 'Name 2'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=NAME2_GP'
    AddressAdditionalName : String(35) not null;
    @Common.Label : 'Name 3'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=NAME3_GP'
    CostCenterAddrName3 : String(35) not null;
    @Common.Label : 'Name 4'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=NAME4_GP'
    CostCenterAddrName4 : String(35) not null;
    @Common.Label : 'City'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=ORT01_GP'
    CityName : String(35) not null;
    @Common.Label : 'District'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=ORT02_GP'
    District : String(35) not null;
    @Common.Label : 'Street'
    @Common.QuickInfo : 'Street and House Number'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=STRAS_GP'
    StreetAddressName : String(35) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'PO Box'
    POBox : String(10) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Postal Code'
    @Common.Heading : 'PostalCode'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=PSTLZ'
    PostalCode : String(10) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'PO Box Postal Code'
    @Common.Heading : 'PO Box PCD'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=PSTL2'
    POBoxPostalCode : String(10) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Region'
    @Common.Heading : 'Rg'
    @Common.QuickInfo : 'Region (State, Province, County)'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REGIO'
    Region : String(3) not null;
    @Common.Label : 'Language Key'
    @Common.Heading : 'Language'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=SPRAS'
    Language : String(2) not null;
    @Common.Label : 'Telebox Number'
    @Common.Heading : 'Telebox'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=TELBX'
    TeleboxNumber : String(15) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Phone'
    PhoneNumber1 : String(16) not null;
    @Common.Label : 'Telephone 2'
    @Common.QuickInfo : 'Second telephone number'
    PhoneNumber2 : String(16) not null;
    @Common.Label : 'Fax Number'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=TELFX'
    FaxNumber : String(31) not null;
    @Common.Label : 'Teletex Number'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=TELTX'
    TeletexNumber : String(30) not null;
    @Common.Label : 'Telex Number'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=TELX1'
    TelexNumber : String(30) not null;
    @Common.Label : 'Data line'
    @Common.QuickInfo : 'Data communication line no.'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=DATLT'
    DataCommunicationPhoneNumber : String(14) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Printer Destination'
    @Common.QuickInfo : 'Printer destination for CCtr report'
    CostCenterPrinterDestination : String(4) not null;
    @Common.FieldControl : #Mandatory
    @Common.IsUpperCase : true
    @Common.Label : 'Standard Hierarchy Node'
    @Common.QuickInfo : 'Cost Center Hierarchy'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=FCO_CC_KHINR'
    CostCenterStandardHierArea : String(12) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Function'
    @Common.Heading : 'Fct'
    @Common.QuickInfo : 'Function of Cost Center'
    CostCenterFunction : String(3) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Altern. Function'
    @Common.Heading : 'A.Fnc'
    @Common.QuickInfo : 'Alternative Function of Cost Center'
    CostCenterAlternativeFunction : String(3) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Functional Area'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=FKBER'
    FunctionalArea : String(16) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Act. Indep. Formula Planning Template'
    @Common.Heading : 'Activity Independent Formula Planning Temlate'
    @Common.QuickInfo : 'Template for Activity-Independent Formula Planning'
    ActyIndepFormulaPlanningTmpl : String(10) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Act. Depen. Formula Planning Template'
    @Common.Heading : 'Activity Dependent Formula Planning Template'
    @Common.QuickInfo : 'Template for Activity-Dependent Formula Planning'
    ActyDepdntFormulaPlanningTmpl : String(10) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Activity Independent Allocation Template'
    @Common.QuickInfo : 'Template: Activity-Independent Allocation to Cost Center'
    ActyIndependentAllocationTmpl : String(10) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Activity Dependent Allocation Template'
    @Common.QuickInfo : 'Template: Activity-Dependent Allocation to Cost Center'
    ActyDependentAllocationTmpl : String(10) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Act. Indep. Statistical Key Figure Tmp.'
    @Common.Heading : 'Activity Indep. Statistical Key Figure Template'
    @Common.QuickInfo : 'Template of Activity Indep. Statistical Key Figure'
    ActlIndepStatisticalKeyFigures : String(10) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Act. Dep. Statistical Key Figure Tmp.'
    @Common.Heading : 'Activity Dep. Statistical Key Figure Template'
    @Common.QuickInfo : 'Template of Activity Dep. Statistical Key Figure'
    ActlDepStatisticalKeyFigures : String(10) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Joint Venture'
    @Common.Heading : 'JV'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=JV_NAME'
    JointVenture : String(6) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Recovery Indicator'
    @Common.Heading : 'RI'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=JV_RECIND'
    JointVentureRecoveryCode : String(2) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Equity Type'
    @Common.Heading : 'ET'
    JointVentureEquityType : String(3) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'JV Object Type'
    @Common.Heading : 'Type'
    @Common.QuickInfo : 'Joint Venture Object Type'
    JointVentureObjectType : String(4) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'JIB/JIBE Class'
    @Common.Heading : 'Class'
    JointVentureClass : String(3) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'JIB/JIBE Subclass A'
    @Common.Heading : 'SCl A'
    JointVentureSubClass : String(5) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Budget-Carrying Cost Center'
    BudgetCarryingCostCenter : String(10) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Budget Availability Control Profile'
    AvailabilityControlProfile : String(6) not null;
    @Common.Label : 'Budget Availability Control is Active'
    AvailabilityControlIsActive : Boolean not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Fund'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=BP_GEBER'
    Fund : String(10) not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Grant'
    @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=GM_GRANT_NBR'
    GrantID : String(20) not null;
    @Common.Label : 'Fund Fixed Assignment'
    @Common.QuickInfo : 'Indicator for Fund with Fixed Assignment'
    FundIsFixAssigned : Boolean not null;
    @Common.Label : 'Grant Fixed Assignment'
    @Common.QuickInfo : 'Indicator for Grant with Fixed Assignment'
    GrantIDIsFixAssigned : Boolean not null;
    @Common.Label : 'Functional Area Fixed Assignment'
    @Common.QuickInfo : 'Indicator for Functional Area with Fixed Assignment'
    FunctionalAreaIsFixAssigned : Boolean not null;
    @Common.Label : 'Is Budget Carrying'
    @Common.QuickInfo : 'Indicator, if cost center is budget carrying'
    CostCenterIsBudgetCarrying : Boolean not null;
    @Common.Label : 'Created At'
    CostCenterCreationTime : Time not null;
    @Common.IsUpperCase : true
    @Common.Label : 'Last Changed By'
    CostCenterLastChangedByUser : String(12) not null;
    @Common.Label : 'Last Changed On'
    CostCenterLastChangedOnDate : Date;
    @Common.Label : 'Last Changed At'
    CostCenterLastChangedAtTime : Time not null;
    SAP__Messages : many SAP__Message not null;
    @Common.Composition : true
    _CostCenterText : Composition of many A_CostCenterText_2 on _CostCenterText._CostCenter = $self;
  } actions {
    action CreateValidityPeriod(
      @Common.FieldControl : #Mandatory
      @Common.IsUpperCase : true
      @Common.Label : 'Cost Center'
      @Common.Heading : 'Cost Ctr'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=KOSTL'
      CostCenter : String(10) not null,
      @Common.FieldControl : #Mandatory
      @Common.Label : 'Valid To'
      @Common.Heading : 'to'
      @Common.QuickInfo : 'Valid To Date'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=DATBI'
      ValidityEndDate : Date,
      @Common.FieldControl : #Mandatory
      @Common.Label : 'Valid From'
      @Common.QuickInfo : 'Valid-From Date'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=DATAB'
      ValidityStartDate : Date,
      @Common.FieldControl : #Mandatory
      @Common.Label : 'Cost Center Name'
      CostCenterName : String(20) not null,
      @Common.FieldControl : #Mandatory
      @Common.Label : 'Cost Center Desc.'
      @Common.Heading : 'CoCtr'
      @Common.QuickInfo : 'Description of Cost Center'
      CostCenterDescription : String(40) not null,
      @Common.FieldControl : #Mandatory
      @Common.IsUpperCase : true
      @Common.Label : 'Company Code'
      @Common.Heading : 'CoCd'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=BUKRS'
      CompanyCode : String(4) not null,
      @Common.FieldControl : #Mandatory
      @Common.IsUpperCase : true
      @Common.Label : 'Cost Center Category'
      @Common.Heading : 'CCtC'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=KOSAR'
      CostCenterCategory : String(1) not null,
      @Common.FieldControl : #Mandatory
      @Common.Label : 'Person Responsible'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=VERAK'
      CostCtrResponsiblePersonName : String(20) not null,
      @Common.FieldControl : #Mandatory
      @Common.IsUpperCase : true
      @Common.Label : 'Standard Hierarchy Node'
      @Common.QuickInfo : 'Cost Center Hierarchy'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=FCO_CC_KHINR'
      CostCenterStandardHierArea : String(12) not null,
      @Common.IsUpperCase : true
      @Common.Label : 'Controlling Area'
      @Common.Heading : 'COAr'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=KOKRS'
      ControllingArea : String(4) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Lock Primary Costs Posting'
      @Common.QuickInfo : 'Lock Indicator for Actual Primary Postings'
      IsBlkdForPrimaryCostsPosting : Boolean not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'User Responsible'
      @Common.Heading : 'User Resp.'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=VERAK_USER'
      CostCtrResponsibleUser : String(12) not null default null,
      @Common.IsCurrency : true
      @Common.IsUpperCase : true
      @Common.Label : 'Currency'
      @Common.Heading : 'Crcy'
      @Common.QuickInfo : 'Currency Key'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=WAERS'
      CostCenterCurrency : String(3) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Tax Jurisdiction'
      @Common.Heading : 'Tax Jur.'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=TXJCD'
      TaxJurisdiction : String(15) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Profit Center'
      @Common.Heading : 'Profit Ctr'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=PRCTR'
      ProfitCenter : String(10) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Logical System'
      @Common.Heading : 'Log.System'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=LOGSYSTEM'
      LogicalSystem : String(10) not null default null,
      @Common.Label : 'Created On'
      CostCenterCreationDate : Date default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Created By'
      CostCenterCreatedByUser : String(12) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Lock Secondary Costs Posting'
      @Common.QuickInfo : 'Lock Indicator for Actual Secondary Costs'
      IsBlkdForSecondaryCostsPosting : Boolean not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Lock Revenue Posting'
      @Common.QuickInfo : 'Lock Indicator for Actual Revenue Postings'
      IsBlockedForRevenuePosting : Boolean not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Lock Commitment Updates'
      @Common.QuickInfo : 'Lock Indicator for Commitment Update'
      IsBlockedForCommitmentPosting : Boolean not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Record Quantity'
      @Common.Heading : 'Qty'
      @Common.QuickInfo : 'Indicator for Recording Consumption Quantities'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=MGEFL'
      ConsumptionQtyIsRecorded : Boolean not null default null,
      @Common.Label : 'Department'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=ABTEI'
      Department : String(12) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Country/Region'
      @Common.Heading : 'Ctry/Reg.'
      Country : String(3) not null default null,
      @Common.Label : 'Title'
      FormOfAddress : String(15) not null default null,
      @Common.Label : 'Address Name'
      @Common.QuickInfo : 'Address name'
      AddressName : String(35) not null default null,
      @Common.Label : 'City'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=ORT01_GP'
      CityName : String(35) not null default null,
      @Common.Label : 'District'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=ORT02_GP'
      District : String(35) not null default null,
      @Common.Label : 'District'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=ORT02_GP'
      StreetAddressName : String(35) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'PO Box'
      POBox : String(10) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Postal Code'
      @Common.Heading : 'PostalCode'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=PSTLZ'
      PostalCode : String(10) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'PO Box Postal Code'
      @Common.Heading : 'PO Box PCD'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=PSTL2'
      POBoxPostalCode : String(10) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Region'
      @Common.Heading : 'Rg'
      @Common.QuickInfo : 'Region (State, Province, County)'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REGIO'
      Region : String(3) not null default null,
      @Common.Label : 'Language Key'
      @Common.Heading : 'Language'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=SPRAS'
      Language : String(2) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Phone'
      PhoneNumber1 : String(16) not null default null,
      @Common.Label : 'Fax Number'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=TELFX'
      FaxNumber : String(31) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Printer Destination'
      @Common.QuickInfo : 'Printer destination for CCtr report'
      CostCenterPrinterDestination : String(4) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Functional Area'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=FKBER'
      FunctionalArea : String(16) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Joint Venture'
      @Common.Heading : 'JV'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=JV_NAME'
      JointVenture : String(6) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Recovery Indicator'
      @Common.Heading : 'RI'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=JV_RECIND'
      JointVentureRecoveryCode : String(2) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Equity Type'
      @Common.Heading : 'ET'
      JointVentureEquityType : String(3) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'JV Object Type'
      @Common.Heading : 'Type'
      @Common.QuickInfo : 'Joint Venture Object Type'
      JointVentureObjectType : String(4) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'JIB/JIBE Class'
      @Common.Heading : 'Class'
      JointVentureClass : String(3) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'JIB/JIBE Subclass A'
      @Common.Heading : 'SCl A'
      JointVentureSubClass : String(5) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Budget-Carrying Cost Center'
      BudgetCarryingCostCenter : String(10) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Budget Availability Control Profile'
      AvailabilityControlProfile : String(6) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Budget Availability Control is Active'
      AvailabilityControlIsActive : Boolean not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Fund'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=BP_GEBER'
      Fund : String(10) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Grant'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=GM_GRANT_NBR'
      GrantID : String(20) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Fund Fixed Assignment'
      @Common.QuickInfo : 'Indicator for Fund with Fixed Assignment'
      FundIsFixAssigned : Boolean not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Grant Fixed Assignment'
      @Common.QuickInfo : 'Indicator for Grant with Fixed Assignment'
      GrantIDIsFixAssigned : Boolean not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Functional Area Fixed Assignment'
      @Common.QuickInfo : 'Indicator for Functional Area with Fixed Assignment'
      FunctionalAreaIsFixAssigned : Boolean not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Is Budget Carrying'
      @Common.QuickInfo : 'Indicator, if cost center is budget carrying'
      CostCenterIsBudgetCarrying : Boolean not null default null,
      @Common.Label : 'Created At'
      CostCenterCreationTime : Time not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Last Changed By'
      CostCenterLastChangedByUser : String(12) not null default null,
      @Common.Label : 'Last Changed On'
      CostCenterLastChangedOnDate : Date default null,
      @Common.Label : 'Last Changed At'
      CostCenterLastChangedAtTime : Time not null default null,
      _CostCenterText : many D_CostCtrCrteValdtyPeriodTxtP not null
    ) returns CostCtrCreateValidityPeriodP_Type not null;
    action UpdateValidityPeriod(
      @Common.FieldControl : #Mandatory
      @Common.IsUpperCase : true
      @Common.Label : 'Cost Center'
      @Common.Heading : 'Cost Ctr'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=KOSTL'
      CostCenter : String(10) not null,
      @Common.FieldControl : #Mandatory
      @Common.Label : 'Valid To'
      @Common.Heading : 'to'
      @Common.QuickInfo : 'Valid To Date'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=DATBI'
      ValidityEndDate : Date,
      @Common.IsUpperCase : true
      @Common.Label : 'Controlling Area'
      @Common.Heading : 'COAr'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=KOKRS'
      ControllingArea : String(4) not null default null,
      @Common.Label : 'Valid To'
      @Common.Heading : 'to'
      @Common.QuickInfo : 'Valid To Date'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=DATBI'
      NewValidityEndDate : Date default null,
      @Common.Label : 'Valid From'
      @Common.QuickInfo : 'Valid-From Date'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=DATAB'
      ValidityStartDate : Date default null,
      @Common.Label : 'Cost Center Name'
      CostCenterName : String(20) not null default null,
      @Common.Label : 'Cost Center Desc.'
      @Common.Heading : 'CoCtr'
      @Common.QuickInfo : 'Description of Cost Center'
      CostCenterDescription : String(40) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Lock Primary Costs Posting'
      @Common.QuickInfo : 'Lock Indicator for Actual Primary Postings'
      IsBlkdForPrimaryCostsPosting : Boolean not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Company Code'
      @Common.Heading : 'CoCd'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=BUKRS'
      CompanyCode : String(4) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Cost Center Category'
      @Common.Heading : 'CCtC'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=KOSAR'
      CostCenterCategory : String(1) not null default null,
      @Common.Label : 'Person Responsible'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=VERAK'
      CostCtrResponsiblePersonName : String(20) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'User Responsible'
      @Common.Heading : 'User Resp.'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=VERAK_USER'
      CostCtrResponsibleUser : String(12) not null default null,
      @Common.IsCurrency : true
      @Common.IsUpperCase : true
      @Common.Label : 'Currency'
      @Common.Heading : 'Crcy'
      @Common.QuickInfo : 'Currency Key'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=WAERS'
      CostCenterCurrency : String(3) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Tax Jurisdiction'
      @Common.Heading : 'Tax Jur.'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=TXJCD'
      TaxJurisdiction : String(15) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Profit Center'
      @Common.Heading : 'Profit Ctr'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=PRCTR'
      ProfitCenter : String(10) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Logical System'
      @Common.Heading : 'Log.System'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=LOGSYSTEM'
      LogicalSystem : String(10) not null default null,
      @Common.Label : 'Created On'
      CostCenterCreationDate : Date default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Created By'
      CostCenterCreatedByUser : String(12) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Lock Secondary Costs Posting'
      @Common.QuickInfo : 'Lock Indicator for Actual Secondary Costs'
      IsBlkdForSecondaryCostsPosting : Boolean not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Lock Revenue Posting'
      @Common.QuickInfo : 'Lock Indicator for Actual Revenue Postings'
      IsBlockedForRevenuePosting : Boolean not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Lock Commitment Updates'
      @Common.QuickInfo : 'Lock Indicator for Commitment Update'
      IsBlockedForCommitmentPosting : Boolean not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Record Quantity'
      @Common.Heading : 'Qty'
      @Common.QuickInfo : 'Indicator for Recording Consumption Quantities'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=MGEFL'
      ConsumptionQtyIsRecorded : Boolean not null default null,
      @Common.Label : 'Department'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=ABTEI'
      Department : String(12) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Country/Region'
      @Common.Heading : 'Ctry/Reg.'
      Country : String(3) not null default null,
      @Common.Label : 'Title'
      FormOfAddress : String(15) not null default null,
      @Common.Label : 'Address Name'
      @Common.QuickInfo : 'Address name'
      AddressName : String(35) not null default null,
      @Common.Label : 'City'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=ORT01_GP'
      CityName : String(35) not null default null,
      @Common.Label : 'District'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=ORT02_GP'
      District : String(35) not null default null,
      @Common.Label : 'District'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=ORT02_GP'
      StreetAddressName : String(35) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'PO Box'
      POBox : String(10) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Postal Code'
      @Common.Heading : 'PostalCode'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=PSTLZ'
      PostalCode : String(10) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'PO Box Postal Code'
      @Common.Heading : 'PO Box PCD'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=PSTL2'
      POBoxPostalCode : String(10) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Region'
      @Common.Heading : 'Rg'
      @Common.QuickInfo : 'Region (State, Province, County)'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REGIO'
      Region : String(3) not null default null,
      @Common.Label : 'Language Key'
      @Common.Heading : 'Language'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=SPRAS'
      Language : String(2) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Phone'
      PhoneNumber1 : String(16) not null default null,
      @Common.Label : 'Fax Number'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=TELFX'
      FaxNumber : String(31) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Printer Destination'
      @Common.QuickInfo : 'Printer destination for CCtr report'
      CostCenterPrinterDestination : String(4) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Standard Hierarchy Node'
      @Common.QuickInfo : 'Cost Center Hierarchy'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=FCO_CC_KHINR'
      CostCenterStandardHierArea : String(12) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Functional Area'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=FKBER'
      FunctionalArea : String(16) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Joint Venture'
      @Common.Heading : 'JV'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=JV_NAME'
      JointVenture : String(6) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Recovery Indicator'
      @Common.Heading : 'RI'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=JV_RECIND'
      JointVentureRecoveryCode : String(2) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Equity Type'
      @Common.Heading : 'ET'
      JointVentureEquityType : String(3) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'JV Object Type'
      @Common.Heading : 'Type'
      @Common.QuickInfo : 'Joint Venture Object Type'
      JointVentureObjectType : String(4) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'JIB/JIBE Class'
      @Common.Heading : 'Class'
      JointVentureClass : String(3) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'JIB/JIBE Subclass A'
      @Common.Heading : 'SCl A'
      JointVentureSubClass : String(5) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Budget-Carrying Cost Center'
      BudgetCarryingCostCenter : String(10) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Budget Availability Control Profile'
      AvailabilityControlProfile : String(6) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Budget Availability Control is Active'
      AvailabilityControlIsActive : Boolean not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Fund'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=BP_GEBER'
      Fund : String(10) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Grant'
      @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=GM_GRANT_NBR'
      GrantID : String(20) not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Fund Fixed Assignment'
      @Common.QuickInfo : 'Indicator for Fund with Fixed Assignment'
      FundIsFixAssigned : Boolean not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Grant Fixed Assignment'
      @Common.QuickInfo : 'Indicator for Grant with Fixed Assignment'
      GrantIDIsFixAssigned : Boolean not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Functional Area Fixed Assignment'
      @Common.QuickInfo : 'Indicator for Functional Area with Fixed Assignment'
      FunctionalAreaIsFixAssigned : Boolean not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Is Budget Carrying'
      @Common.QuickInfo : 'Indicator, if cost center is budget carrying'
      CostCenterIsBudgetCarrying : Boolean not null default null,
      @Common.Label : 'Created At'
      CostCenterCreationTime : Time not null default null,
      @Common.IsUpperCase : true
      @Common.Label : 'Last Changed By'
      CostCenterLastChangedByUser : String(12) not null default null,
      @Common.Label : 'Last Changed On'
      CostCenterLastChangedOnDate : Date default null,
      @Common.Label : 'Last Changed At'
      CostCenterLastChangedAtTime : Time not null default null,
      _CostCenterText : many D_CostCtrUpdtValdtyPeriodTxtP not null
    ) returns CostCtrUpdateValidityPeriodP_Type not null;
  };
};

