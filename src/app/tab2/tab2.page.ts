import { Component } from '@angular/core';
import { HealthKit,HealthKitOptions } from '@ionic-native/health-kit/ngx';
import { Platform } from "@ionic/angular";


@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  weight: number;
  gender='';
  CurrentWeight: "No Data";
  CurrentHeight: "";
  stepcount: "No Data";
  distance = "No";
  workouts = [];
  bloodType= "";
  dob = "";
  constructor(private plt: Platform, private healthKit: HealthKit) {
    this.plt.ready().then(() => {
      this.healthKit.available().then(available => {
        if (available) {
          var options: HealthKitOptions = {
            readTypes: [
              "HKQuantityTypeIdentifierWeight",
              "HKQuantityTypeIdentifierStepCount",
              "HKWorkoutTypeIdentifier",
              "HKQuantityTypeIdentifierActiveEnergyBurned",
              "HKQuantityTypeIdentifierDistanceCycling",
              "HKQuantityTypeIdentifierDistanceWalkingRunning"
            ],
            writeTypes: [
              "HKQuantityTypeIdentifierWeight",
              "HKWorkoutTypeIdentifier",
              "HKQuantityTypeIdentifierActiveEnergyBurned",
              "HKQuantityTypeIdentifierDistanceCycling"
            ]
          };
          this.healthKit.requestAuthorization(options).then(_ => {
            this.loadHealthData();
          });
        }
      });
      this.loadHealthData();
    });
  }

  saveWeight() {
    this.healthKit.saveWeight({ unit: "kg", amount: this.weight }).then(_ => {
      this.weight = null;
      this.loadHealthData();
    });
  }

  saveWorkOut() {
    let workout = {
      activityType: "HKWorkoutActivityTypeCycling",
      quantityType: "HKQuantityTypeIdentifierDistanceCycling",
      startDate: new Date(), // now
      endDate: null, // not needed when using duration
      duration: 6000, //in seconds
      energy: 400, //
      energyUnit: "kcal", // J|cal|kcal
      distance: 5, // optional
      distanceUnit: "km"
    };
    this.healthKit.saveWorkout(workout).then(res => {
      this.loadHealthData();
    });
  }

  loadHealthData() {
    this.healthKit.readGender().then(res=>{
      this.gender = res;
    })

    this.healthKit.readWeight({ unit: "kg" }).then(
      val => {
        this.CurrentWeight = val.value;
      },
      err => {
        console.log("No Weight: ", err);
      }
    );

    this.healthKit.readBloodType().then(res=>{
      this.bloodType = res;
    }, err=> {
      this.bloodType = err;
    })

    this.healthKit.readDateOfBirth().then(res=>{
      this.dob = res;
    }, err=> {
      this.dob = err;
    })

    this.healthKit.readHeight({ unit: "cm" }).then(
      val => {
        this.CurrentHeight = val.value;
      },
      err => {
        console.log("No Height: ", err);
      }
    );

    var stepOptions = {
      startDate: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
      endDate: new Date(),
      sampleType: "HKQuantityTypeIdentifierStepCount",
      unit: "count"
    };
    var distanceOption = {
      startDate: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
      endDate: new Date(),
      sampleType: "HKQuantityTypeIdentifierDistanceWalkingRunning",
      unit: "km"
    };
    this.healthKit.querySampleType(distanceOption).then(res =>{
      let dist = res.reduce((a, b)=> a + b.quantity,0);
    this.distance = dist;
    });

    this.healthKit.querySampleType(stepOptions).then(
      data => {
        let stepSum = data.reduce((a, b) => a + b.quantity, 0);
        this.stepcount = stepSum;
      },
      err => {
        console.log("No steps: ", err);
      }
    );

    this.healthKit.findWorkouts().then(
      data => {
        this.workouts = data;
      },
      err => {
        console.log("no workouts: ", err);
        // Sometimes the result comes in here, very strange.
        this.workouts = err;
      }
    );
  }
}
/////////////////////////////////////////////////////////////////////////


