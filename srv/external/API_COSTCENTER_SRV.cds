
service API_COSTCENTER_SRV {
  entity A_CostCenter_2 {
    key CostCenter                    : String;
    key ControllingArea               : String;
    key ValidityEndDate               : Date;
        ValidityStartDate             : Date;
        CostCenterName                : String;
        CompanyCode                   : String;
        CostCenterCurrency            : String;
        IsBlockedForCommitmentPosting : Boolean;
  }
}
