import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Float "mo:core/Float";

module {
  type Employee = {
    fiplCode : Text;
    name : Text;
    role : Text;
    department : Text;
    region : Text;
    status : { #active; #onHold };
    joinDate : Text;
    fseCategory : Text;
  };

  type Performance = {
    fiplCode : Text;
    salesInfluenceIndex : Float;
    reviewCount : Nat;
    operationalDiscipline : Float;
    productKnowledgeScore : Float;
    softSkillsScore : Float;
    demoVisits : Nat;
    complaintVisits : Nat;
    videoCallDemos : Nat;
  };

  type SWOT = {
    fiplCode : Text;
    strengths : [Text];
    weaknesses : [Text];
    opportunities : [Text];
    threats : [Text];
    cesScore : Float;
  };

  type SalesRecord = {
    recordId : Nat;
    fiplCode : Text;
    brand : { #ecovacs; #kuvings; #coway; #tineco; #instant };
    product : Text;
    saleType : { #accessories; #extendedWarranty };
    quantity : Nat;
    amount : Float;
    saleDate : Text;
  };

  type Attendance = {
    recordId : Nat;
    fiplCode : Text;
    labType : { #attendance; #eod; #daysBrief };
    daysOff : Nat;
    reason : Text;
    date : Text;
  };

  type FeedbackEntry = {
    entryId : Nat;
    fiplCode : Text;
    customerName : Text;
    contact : Text;
    brand : { #ecovacs; #kuvings; #coway; #tineco; #instant };
    product : Text;
    cesScore : Float;
    remark : Text;
    callDate : Text;
    agent : Text;
  };

  type TopPerformer = {
    rank : Nat;
    fiplCode : Text;
    name : Text;
    accessories : Nat;
    extendedWarranty : Nat;
    totalSales : Float;
  };

  type OldActor = {
    employees : Map.Map<Text, Employee>;
    performances : Map.Map<Text, Performance>;
    swots : Map.Map<Text, SWOT>;
    salesRecords : Map.Map<Nat, SalesRecord>;
    attendanceRecords : Map.Map<Nat, Attendance>;
    feedbackEntries : Map.Map<Nat, FeedbackEntry>;
    salesByFIPL : Map.Map<Text, List.List<Nat>>;
    attendanceByFIPL : Map.Map<Text, List.List<Nat>>;
    feedbackByFIPL : Map.Map<Text, List.List<Nat>>;
    nextSalesId : Nat;
    nextAttendanceId : Nat;
    nextFeedbackId : Nat;
  };

  type NewActor = {
    employees : Map.Map<Text, Employee>;
    performances : Map.Map<Text, Performance>;
    swots : Map.Map<Text, SWOT>;
    salesRecords : Map.Map<Nat, SalesRecord>;
    attendanceRecords : Map.Map<Nat, Attendance>;
    feedbackEntries : Map.Map<Nat, FeedbackEntry>;
    topPerformers : Map.Map<Nat, TopPerformer>;
    salesByFIPL : Map.Map<Text, List.List<Nat>>;
    attendanceByFIPL : Map.Map<Text, List.List<Nat>>;
    feedbackByFIPL : Map.Map<Text, List.List<Nat>>;
    nextSalesId : Nat;
    nextAttendanceId : Nat;
    nextFeedbackId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    {
      employees = old.employees;
      performances = old.performances;
      swots = old.swots;
      salesRecords = old.salesRecords;
      attendanceRecords = old.attendanceRecords;
      feedbackEntries = old.feedbackEntries;
      topPerformers = Map.empty<Nat, TopPerformer>();
      salesByFIPL = old.salesByFIPL;
      attendanceByFIPL = old.attendanceByFIPL;
      feedbackByFIPL = old.feedbackByFIPL;
      nextSalesId = old.nextSalesId;
      nextAttendanceId = old.nextAttendanceId;
      nextFeedbackId = old.nextFeedbackId;
    };
  };
};
