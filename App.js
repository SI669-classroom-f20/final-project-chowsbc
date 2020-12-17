//let's leave all of these imports in as we might need some of them later
import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { TextInput, Text, View, FlatList, TouchableOpacity, Image, KeyboardAvoidingView, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { styles, colors } from './Styles';
import firebase from 'firebase';
import '@firebase/firestore';
import { firebaseConfig } from './Secrets.js';
import fetch from 'node-fetch';
import { CheckBox } from 'react-native-elements'
import { Switch } from 'react-native-gesture-handler';    

const Stack = createStackNavigator();
const appName = "ListMaker 3000";
if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
const invCollRef = db.collection('pets');
const usersRef = db.collection('users');

//Needed for conditional rendering of the buttons or pets in the pet list
let presentlist= '';
let firstItem = '';
let appPets = [];
let feedbutton = '';
let users = []; // MAGGIE 16

//Adds pet to firebase using props from naming screeen
async function addNewToFireBase(species, pic, name, key, index){ //uncessessary required variables removed
  let itemRef = db.collection('pets').doc(String(index));  
    itemRef.set ({
        species:species,
        pic:pic,
        name:name,
        key:key,
        Stamina: 50,
        Happiness: 40, // MAGGIE E: for testing!
        canFeed: true,  // MAGGIE
        canPlay: true,
        dateAdded: new Date (),
        index: index
    });
  }

  async function UpdateToFireBase(species, pic, name, key, Stamina, Happiness, canFeed, canPlay, dateAdded, index){ //STEPHEN---update function has more required variables so that it can replace old pet documents without adding in pre-set values
    
    let newPet = {  // MAGGIE E
      species:species,
      pic:pic,
      name:name,
      key:key,
      Stamina:Stamina,
      Happiness:Happiness,
      canFeed: canFeed,
      canPlay: canPlay,
      dateAdded: dateAdded,
      index: index
  }
    let itemRef = db.collection('pets').doc(String(index));
    await itemRef.update(newPet);  
    let petIndex = -1;
    for (let i in appPets) {
      if (appPets[i].key === key) {
        petIndex = i;
        break;
      }
    }
    if (petIndex !== -1) {
      newPet.key = key;
      appPets[petIndex] = newPet;
    }
  }

  //Load function
  async function getPets() { // MAGGIE
    appPets = [];
    let qSnap = await invCollRef.get();
    qSnap.forEach(qDocSnap => {
      // let key = qDocSnap.id;  // MAGGIE E
      let data = qDocSnap.data();
      // data.key = key;  // MAGGIE E
      appPets.push(data);
    });
  }

  async function loadUsers() { // MAGGIE 16
    let querySnap = await usersRef.get();
    querySnap.forEach(qDocSnap => {
      let key = qDocSnap.id;
      let data = qDocSnap.data();
      data.key = key;
      users.push(data);
    });
  }

  function getUsers() { // MAGGIE 16
    return users;
  }

  async function createUser(email, pass, dispName) { // MAGGIE 16
    let newUser = {
      email: email,
      password: pass,
      displayName: dispName
    }
    let newUserDocRef = await usersRef.add(newUser);
    
    // get the new Firebase ID and save it as the local "key"
    let key = newUserDocRef.id;
    newUser.key = key;
    users.push(newUser);
    return newUser;
  }

  function getUserForID(id) { // MAGGIE 16
    for (let user of users) {
      if (user.key === id) {
        return user;
      }
    }
  }


  function activateFeed(pet) { // MAGGIE: not sure if this works, needs testing
    UpdateToFireBase(pet.species, pet.pic, pet.name, pet.key, pet.Stamina,pet.Happiness, true, pet.canPlay, pet.dateAdded, pet.index);
    pet.canFeed = true; // MAGGIE 16
    // feedbutton = true;
  }

  function activatePlay(pet) { // MAGGIE: not sure if this works, needs testing
    UpdateToFireBase(pet.species, pet.pic, pet.name, pet.key, pet.Stamina,pet.Happiness, pet.canFeed, true, pet.dateAdded, pet.index);
    pet.canPlay = true; // MAGGIE 16
    // playbutton = true;
  }

  async function refreshFeed(pet, feedbutton) { // MAGGIE 16
    if (pet.canFeed == true) {
      return;
    }
    else {
      setTimeout(() => feedbutton = activateFeed(pet), 10000);

    }
  }

  async function refreshPlay(pet, playbutton) { // MAGGIE 16
    if (pet.canPlay == true) {
      return;
    }
    else {
      setTimeout(() => playbutton = activatePlay(pet), 10000); // MAGGIE 16
    }
    
  }

export class LoginScreen extends React.Component {
  constructor(props) { // MAGGIE 16
    super(props);
    this.state = {
      mode: 'login',
      emailInput: '',
      displayNameInput: '',
      passwordInput: '',
      passwordCheckInput: ''
    }
  }

  onCreateAccount = async() => { // MAGGIE 16
    let users = getUsers();
    for (let user of users) {
      if (user.email === this.state.emailInput) {
        console.log("found matching user");
        Alert.alert(
          'Duplicate User',
          'User ' + this.state.emailInput + ' already exists.',
          [{ text: 'OK',style: 'OK'}]
        );
        return;
      }
    } // made it through loop, no user exists!
    console.log("no matching user found, creating"); 
    let newUser = await createUser(
      this.state.emailInput,
      this.state.passwordInput,
      this.state.displayNameInput,
      );
    this.props.navigation.navigate("Home", {
      currentUser: newUser,
    });
  }

  onLogin = () => {
    let users = getUsers();
    let email = this.state.emailInput;
    let pass = this.state.passwordInput;
    for (let user of users) {
      if (user.email === email) {
        if (user.password === pass) {
          // success!
          this.props.navigation.navigate("Home", {
            currentUser: user,
          });
          return;
        }
      }
    }
    // we got through all the users with no match, so failure.
    Alert.alert(
      'Login Failed',
      'No match found for this email and password.',
      [{ text: 'OK',style: 'OK'}]
    );
  }

  render() {
    return (
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={"height"}
        keyboardVerticalOffset={10}>
        <View style ={styles.header}>
          <Text style={styles.headertext}>
            User Login
          </Text>
        </View>
        <View style={styles.middleView}>
          <View style={styles.inputRow}>
            <Text 
              style={styles.inputLabel}
            >Email:</Text>
            <TextInput
              style={styles.inputText}
              keyboardType='email-address'
              autoCapitalize='none'
              autoCorrect={false}
              autoCompleteType='email'
              textContentType='emailAddress'
              value={this.state.emailInput}
              onChangeText={(text)=>{this.setState({emailInput: text})}}
            />
          </View>
          {this.state.mode === 'create' ? (
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Display Name:</Text>
              <TextInput
                style={styles.inputText}
                autoCapitalize='none'
                autoCorrect={false}
                value={this.state.displayNameInput}
                onChangeText={(text)=>{this.setState({displayNameInput: text})}}
              />
            </View>
          ):(
            <View/>
          )}
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Password:</Text>
            <TextInput
              style={styles.inputText}
              autoCapitalize='none'
              autoCorrect={false}
              textContentType='password'
              value={this.state.passwordInput}
              onChangeText={(text)=>{this.setState({passwordInput: text})}}
          />
          </View>
          {this.state.mode === 'create' ? (
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Re-enter Password:</Text>
              <TextInput
                style={styles.inputText}
                autoCapitalize='none'
                autoCorrect={false}
                textContentType='password'  
                value={this.state.passwordCheckInput}
                onChangeText={(text)=>{this.setState({passwordCheckInput: text})}}
              />
            </View>
          ):(
            <View/>
          )}
        </View>
        {this.state.mode === 'login' ? (

          <View style={styles.bottomView}>
            <TouchableOpacity 
              style={styles.buttonContainer}
              onPress={()=>{
                this.setState({mode: 'create'})
              }}
              >
              <Text style={styles.buttonText}>Create Account</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.buttonContainer}
              onPress={this.onLogin}
            >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          </View>

        ):(

          <View style={styles.bottomView}>
            <TouchableOpacity 
              style={styles.buttonContainer}
              onPress={()=>{
                this.setState({mode: 'login'})
              }}
              >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.buttonContainer}
              onPress={this.onCreateAccount}
              >
              <Text style={styles.buttonText}>Create</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    );
  }

}


class HomeScreen extends React.Component {

    //firebase will only have up to 3 items, that corrospond to keys 1, 2, or 3.

    constructor(props) {
        super(props);
     //   this.currentUser = this.props.route.params.currentUser;
        this.nextKey = 0;
        this.place = '';
        appPets = [];
        this.state = {
          theList: '',
          pet1: '',
          pet2: '',
          pet3: '',
         
          list_wascreated: false,
        }
      }

      //Trigger load function, update dataframe
      async updateDataframe() {
        await getPets();
        
        console.log(appPets)
        this.setState({theList:appPets});
        this.setState({list_wascreated:true});

        if (this.state.theList[0]) {
        this.state.pet1 = this.state.theList[0];
        }
        if (this.state.theList[1]) {
        this.state.pet2 = this.state.theList[1];
        }
        if (this.state.theList[2]) {
        this.state.pet3 = this.state.theList[2];
        }

        /*for(let i=0; i < 3; i++){
         this.state.pet = this.state.theList[i];
         console.log("curentpet = ", this.state.pet);
      }*/
     // console.log('brrr')
          if (this.state.theList[0]) {
           if (this.state.pet1.Happiness <= 0 || this.state.pet1.Stamina <= 0) {
            this.onDeletePet(this.state.pet1.key)
            }
          await this.updateTimer(this.state.pet1.key, this.state.pet1, this.state.pet1.dateAdded, this.state.pet1.Stamina, this.state.pet1.Happiness, this.state.pet1.index);
          }
          if (this.state.theList[1]) {
            if (this.state.pet2.Happiness <= 0 || this.state.pet2.Stamina <= 0) {
              this.onDeletePet(this.state.pet2.key)
            }
         await this.updateTimer(this.state.pet2.key, this.state.pet2, this.state.pet2.dateAdded, this.state.pet2.Stamina, this.state.pet2.Happiness, this.state.pet2.index);
          }
          if (this.state.theList[2]) {
            if (this.state.pet3.Happiness <= 0 || this.state.pet3.Stamina <= 0) {
              this.onDeletePet(this.state.pet3.key)
            }
          await this.updateTimer(this.state.pet3.key, this.state.pet3, this.state.pet3.dateAdded, this.state.pet3.Stamina, this.state.pet3.Happiness, this.state.pet3.index);
          }
       //   console.log('swaswa')
          await getPets();
          this.setState({theList:appPets});
          this.setState({list_wascreated:true})        
      }

      updateTimer = async(id, pet, dateAdded, stamina, happiness, index) => { //ALISON - updateTimer reduces stamina and happiness over time
    

        let latestDate = new Date();
          
    
        let dateDifference = (latestDate - dateAdded.toDate());
            // console.log("Date difference is:  ", dateDifference);  //time returned is in milliseconds
          
    
        //milliseconds per hour 3,600,000
        //milliseconds per day 86,400,000
        //milliseconds per minute 60,000
    
        let multiplier = 0
        let pointsToRemove = 10;
    
        if(dateDifference > 3000 && stamina !=0 && happiness !=0 )  //for testing: swap 86400000 for 60000 to test in minutes
    
        multiplier = Math.floor(dateDifference/3000); //for testing: swap 86400000 for 60000 to test in minutes
             //console.log("multiplyer is : ", multiplier);
          
        multipliedPointsToRemove = pointsToRemove * multiplier  //mulitply number of days by number of points to remove per dat
        
          stamina -= multipliedPointsToRemove;
          happiness -= multipliedPointsToRemove;
    
       pet.dateAdded = latestDate;  //ALISON - update dateAdded every time the user interacts with their pet - updateTimer() gets called when the pet page laods after the user clicks the Interact button
       pet.stamina = stamina;
       pet.happiness = happiness;
    
       if (stamina <= 0 || happiness <= 0){
         this.onDeletePet(index)
       }
    
       UpdateToFireBase(pet.species, pet.pic, pet.name, pet.key, pet.stamina, pet.happiness, pet.canFeed, pet.canPlay, pet.dateAdded, pet.index)
    
      }



      async onDeletePet(key) { //STEPHEN
        let inventoryRef = db.collection('pets');
        let itemDoc = inventoryRef.doc(String(key));
        await itemDoc.delete();
        this.updateDataframe();
      }
    

      //creates a list of keys that corrospond to existing firebase items. List will have a zero at the end. This is needed for conditional rendering
      createlist() {
        presentlist = [];
        for (item of this.state.theList) {
          presentlist.push(item.key);
          }
        presentlist.push(0);
        return presentlist;
      }
      

      async componentDidMount() {
        this.focusUnsubscribe = this.props.navigation.addListener('focus', this.onFocus);
        this.updateDataframe();
        this.createlist();
        }
    
        componentWillUnmount() {
        this.focusUnsubscribe();
      }

      onFocus = () => {
        this.updateDataframe()
      }

//redner function gets a list keys of present firebase items (1, 2, or 3). Then, three petlist_items (petlist_item 1, 2, and 3) are conditionally rendered
//either as buttons or as the name of the pet and the picture. TODO: picture is currently rednered as <<species>>.jpg. Have this render as an actual jpg and
//place a picture of the species in assets.

//Buttons are conditionally rendered when a pet item is absent. Pressing a button, pass a "place" to the PetMaker class.
//<<Petname>> and <<species>>.jpg rednered when a pet item is rednered when there is a corrosponding pet item in firebase
render() {
  presentlist = [];
  presentlist = this.createlist();
  let introtext; 
  if (this.state.list_wascreated === true) {
  if (presentlist.includes(1)) {
    firstItem = this.state.theList.find((element) => {return element.key === 1 })
    introtext=
  <View>
  <Text>{firstItem.name}</Text>
  </View>
  }
  else {
    introtext = 
    <TouchableOpacity 
      style={styles.footerButton}
      onPress={()=>{this.props.navigation.navigate("Maker", {
        Place: 1,
        })}}>
      <Text>Pet 1</Text>
    </TouchableOpacity>
}
  }
  else {

  }
let petlistimage1;
if (firstItem.species === 'Dog' && presentlist.includes(1) && firstItem.Stamina >= 50 && firstItem.Happiness >= 50){ //STEPHEN
  petlistimage1 = 
  <Image style={styles.petImageStyle1} source={require('./images/pixeldog3.png')}/>  
  }
if (firstItem.species === 'Dog' && presentlist.includes(1) && firstItem.Stamina < 50 && firstItem.Happiness < 50){
  petlistimage1 = 
  <Image style={styles.petImageStyle1} source={require('./images/pixeldog3_sick_sad.png')}/>  
  }
if (firstItem.species === 'Dog' && presentlist.includes(1) && firstItem.Stamina < 50 && firstItem.Happiness >= 50){
  petlistimage1 = 
  <Image style={styles.petImageStyle1} source={require('./images/pixeldog3_sick.png')}/>  
}
if (firstItem.species === 'Dog' && presentlist.includes(1) && firstItem.Stamina >= 50 && firstItem.Happiness < 50){
  petlistimage1 = 
  <Image style={styles.petImageStyle1} source={require('./images/pixeldog3_sad.png')}/>  
}

if (firstItem.species === 'Cat' && presentlist.includes(1) && firstItem.Stamina >= 50 && firstItem.Happiness >= 50){
  petlistimage1 = 
  <Image style={styles.petImageStyle1} source={require('./images/pixelcat3.png')}/>  
  }
if (firstItem.species === 'Cat' && presentlist.includes(1) && firstItem.Stamina < 50 && firstItem.Happiness < 50){
  petlistimage1 = 
  <Image style={styles.petImageStyle1} source={require('./images/pixelcat3_sad_sick.png')}/>  
  }
if (firstItem.species === 'Cat' && presentlist.includes(1) && firstItem.Stamina < 50 && firstItem.Happiness >= 50){
  petlistimage1 = 
  <Image style={styles.petImageStyle1} source={require('./images/pixelcat3_sick.png')}/>  
}
if (firstItem.species === 'Cat' && presentlist.includes(1) && firstItem.Stamina >= 50 && firstItem.Happiness < 50){
  petlistimage1 = 
  <Image style={styles.petImageStyle1} source={require('./images/pixelcat3_sad.png')}/>  
}

if (firstItem.species === 'Bird' && presentlist.includes(1) && firstItem.Stamina >= 50 && firstItem.Happiness >= 50){
  petlistimage1 = 
  <Image style={styles.petImageStyle1} source={require('./images/pixelbird3.png')}/>  
  }
if (firstItem.species === 'Bird' && presentlist.includes(1) && firstItem.Stamina < 50 && firstItem.Happiness < 50){
  petlistimage1 = 
  <Image style={styles.petImageStyle1} source={require('./images/pixelbird3_sick_sad.png')}/>  
  }
if (firstItem.species === 'Bird' && presentlist.includes(1) && firstItem.Stamina < 50 && firstItem.Happiness >= 50){
  petlistimage1 = 
  <Image style={styles.petImageStyle1} source={require('./images/pixelbird3_sick.png')}/>  
}
if (firstItem.species === 'Bird' && presentlist.includes(1) && firstItem.Stamina >= 50 && firstItem.Happiness < 50){
  petlistimage1 = 
  <Image style={styles.petImageStyle1} source={require('./images/pixelbird3_sad.png')}/>  
}

let petbutton1;
if (presentlist.includes(1)) {
  petbutton1 =
  <TouchableOpacity 
      style={styles.interactbutton}
      onPress={()=>{   
        this.props.navigation.navigate("Interact", {
        Place: presentlist.indexOf(1),
        })
        }}>
      <Text>Interact</Text>
    </TouchableOpacity>
}





let introtext2;
presentlist = [];
presentlist = this.createlist();
for (item of this.state.theList) {
  presentlist.push(item.key)
}
if (this.state.list_wascreated === true) {
if (presentlist.includes(2)) {
firstItem = this.state.theList.find((element) => {return element.key === 2 })
introtext2=
<View>
<Text>{firstItem.name}</Text>
</View>

}
else {
introtext2 = 
<TouchableOpacity 
  style={styles.footerButton}
  onPress={()=>{this.props.navigation.navigate("Maker", {
    Place: 2,
    })}}>
  <Text>Pet 2</Text>
</TouchableOpacity>
}
}

else{

}

let petlistimage2;
if (firstItem.species === 'Dog' && presentlist.includes(2) && firstItem.Stamina >= 50 && firstItem.Happiness >= 50){ //STEPHEN- if statements are used to decide which dog pic is shown, given Stamina and Hapiness
  petlistimage2 = 
  <Image style={styles.petImageStyle1} source={require('./images/pixeldog3.png')}/>  
  }
if (firstItem.species === 'Dog' && presentlist.includes(2) && firstItem.Stamina < 50 && firstItem.Happiness < 50){
  petlistimage2 = 
  <Image style={styles.petImageStyle1} source={require('./images/pixeldog3_sick_sad.png')}/>  
  }
if (firstItem.species === 'Dog' && presentlist.includes(2) && firstItem.Stamina < 50 && firstItem.Happiness >= 50){
  petlistimage2 = 
  <Image style={styles.petImageStyle1} source={require('./images/pixeldog3_sick.png')}/>  
}
if (firstItem.species === 'Dog' && presentlist.includes(2) && firstItem.Stamina >= 50 && firstItem.Happiness < 50){
  petlistimage2 = 
  <Image style={styles.petImageStyle1} source={require('./images/pixeldog3_sad.png')}/>  
}

if (firstItem.species === 'Cat' && presentlist.includes(2) && firstItem.Stamina >= 50 && firstItem.Happiness >= 50){
  petlistimage2 = 
  <Image style={styles.petImageStyle1} source={require('./images/pixelcat3.png')}/>  
  }
if (firstItem.species === 'Cat' && presentlist.includes(2) && firstItem.Stamina < 50 && firstItem.Happiness < 50){
  petlistimage2 = 
  <Image style={styles.petImageStyle1} source={require('./images/pixelcat3_sad_sick.png')}/>  
  }
if (firstItem.species === 'Cat' && presentlist.includes(2) && firstItem.Stamina < 50 && firstItem.Happiness >= 50){
  petlistimage2 = 
  <Image style={styles.petImageStyle1} source={require('./images/pixelcat3_sick.png')}/>  
}
if (firstItem.species === 'Cat' && presentlist.includes(2) && firstItem.Stamina >= 50 && firstItem.Happiness < 50){
  petlistimage2 = 
  <Image style={styles.petImageStyle1} source={require('./images/pixelcat3_sad.png')}/>  
}

if (firstItem.species === 'Bird' && presentlist.includes(2) && firstItem.Stamina >= 50 && firstItem.Happiness >= 50){
  petlistimage2 = 
  <Image style={styles.petImageStyle1} source={require('./images/pixelbird3.png')}/>  
  }
if (firstItem.species === 'Bird' && presentlist.includes(2) && firstItem.Stamina < 50 && firstItem.Happiness < 50){
  petlistimage2 = 
  <Image style={styles.petImageStyle1} source={require('./images/pixelbird3_sick_sad.png')}/>  
  }
if (firstItem.species === 'Bird' && presentlist.includes(2) && firstItem.Stamina < 50 && firstItem.Happiness >= 50){
  petlistimage2 = 
  <Image style={styles.petImageStyle1} source={require('./images/pixelbird3_sick.png')}/>  
}
if (firstItem.species === 'Bird' && presentlist.includes(2) && firstItem.Stamina >= 50 && firstItem.Happiness < 50){
  petlistimage2 = 
  <Image style={styles.petImageStyle1} source={require('./images/pixelbird3_sad.png')}/>  
}

let petbutton2;
if (presentlist.includes(2)) {
  petbutton2 =
  <TouchableOpacity 
      style={styles.interactbutton}
      onPress={()=>{this.props.navigation.navigate("Interact", {
        Place: presentlist.indexOf(2),
        })}}>
      <Text>Interact</Text>
    </TouchableOpacity>
}


let introtext3;
presentlist = [];    
presentlist = this.createlist();
for (item of this.state.theList) {
  presentlist.push(item.key)
}
if (this.state.list_wascreated === true){
if (presentlist.includes(3)) {
firstItem = this.state.theList.find((element) => {return element.key === 3 })
introtext3=
<View>
<Text>{firstItem.name}</Text>
</View>
}

else {
introtext3 = 
<TouchableOpacity 
  style={styles.footerButton}
  onPress={()=>{this.props.navigation.navigate("Maker", {
    Place: 3,
    })}}>
  <Text>Pet 3</Text>
</TouchableOpacity> 
}
}

else {

}

let petlistimage3;
if (firstItem.species === 'Dog' && presentlist.includes(3) && firstItem.Stamina >= 50 && firstItem.Happiness >= 50){ //STEPHEN
  petlistimage3 = 
  <Image style={styles.petImageStyle1} source={require('./images/pixeldog3.png')}/>  
  }
if (firstItem.species === 'Dog' && presentlist.includes(3) && firstItem.Stamina < 50 && firstItem.Happiness < 50){
  petlistimage3 = 
  <Image style={styles.petImageStyle1} source={require('./images/pixeldog3_sick_sad.png')}/>  
  }
if (firstItem.species === 'Dog' && presentlist.includes(3) && firstItem.Stamina < 50 && firstItem.Happiness >= 50){
  petlistimage3 = 
  <Image style={styles.petImageStyle1} source={require('./images/pixeldog3_sick.png')}/>  
}
if (firstItem.species === 'Dog' && presentlist.includes(3) && firstItem.Stamina >= 50 && firstItem.Happiness < 50){
  petlistimage3 = 
  <Image style={styles.petImageStyle1} source={require('./images/pixeldog3_sad.png')}/>  
}

if (firstItem.species === 'Cat' && presentlist.includes(3) && firstItem.Stamina >= 50 && firstItem.Happiness >= 50){
  petlistimage3 = 
  <Image style={styles.petImageStyle1} source={require('./images/pixelcat3.png')}/>  
  }
if (firstItem.species === 'Cat' && presentlist.includes(3) && firstItem.Stamina < 50 && firstItem.Happiness < 50){
  petlistimage3 = 
  <Image style={styles.petImageStyle1} source={require('./images/pixelcat3_sad_sick.png')}/>  
  }
if (firstItem.species === 'Cat' && presentlist.includes(3) && firstItem.Stamina < 50 && firstItem.Happiness >= 50){
  petlistimage3 = 
  <Image style={styles.petImageStyle1} source={require('./images/pixelcat3_sick.png')}/>  
}
if (firstItem.species === 'Cat' && presentlist.includes(3) && firstItem.Stamina >= 50 && firstItem.Happiness < 50){
  petlistimage3 = 
  <Image style={styles.petImageStyle1} source={require('./images/pixelcat3_sad.png')}/>  
}

if (firstItem.species === 'Bird' && presentlist.includes(3) && firstItem.Stamina >= 50 && firstItem.Happiness >= 50){
  petlistimage3 = 
  <Image style={styles.petImageStyle1} source={require('./images/pixelbird3.png')}/>  
  }
if (firstItem.species === 'Bird' && presentlist.includes(3) && firstItem.Stamina < 50 && firstItem.Happiness < 50){
  petlistimage3 = 
  <Image style={styles.petImageStyle1} source={require('./images/pixelbird3_sick_sad.png')}/>  
  }
if (firstItem.species === 'Bird' && presentlist.includes(3) && firstItem.Stamina < 50 && firstItem.Happiness >= 50){
  petlistimage3 = 
  <Image style={styles.petImageStyle1} source={require('./images/pixelbird3_sick.png')}/>  
}
if (firstItem.species === 'Bird' && presentlist.includes(3) && firstItem.Stamina >= 50 && firstItem.Happiness < 50){
  petlistimage3 = 
  <Image style={styles.petImageStyle1} source={require('./images/pixelbird3_sad.png')}/>  
}

let petbutton3;
if (presentlist.includes(3)) {
  petbutton3 =
  <TouchableOpacity 
      style={styles.interactbutton}
      onPress={()=>{this.props.navigation.navigate("Interact", {
        Place: presentlist.indexOf(3),
        })}}>
      <Text>Interact</Text>
    </TouchableOpacity>
}

  return (
      <View style={styles.footerButtonContainer}>
          <View style={styles.petobject}>
            {introtext}
            <View style={styles.petImageStyle1}>
              {petlistimage1}
            </View>
            {petbutton1}
          </View>
          <View style={styles.petobject}>
            {introtext2}
            <View style={styles.petImageStyle1}>
              {petlistimage2}
            </View>
            {petbutton2}
          </View>
          <View style={styles.petobject}>
          {introtext3}
            <View style={styles.petImageStyle1}>
              {petlistimage3}
            </View>
            {petbutton3}
          </View>
        </View>
   );
}
}

class PetMaker extends React.Component {

    constructor(props) {
        super(props);
        appPets = [];
        this.operation = this.props.route.params.operation;
        this.place = '';
        this.animal = '';
        this.picture = '';
      }

      async updateDataframe() {
        await getPets();
        this.setState({theList:appPets});
        theList = this.state.theList;

        }

      async componentDidMount() {
        this.focusUnsubscribe = this.props.navigation.addListener('focus', this.onFocus);
        this.pressed = false;
        }

      //recieves "place" from Homescreen
      onFocus = () => {
        this.place = this.props.route.params.Place;
      }

  //buttons pass the Animal(species), the Picture, the pet's place in the list, to the PetNamer class.

render() {
    return (
    <View>

        <View style ={styles.header}>
          <Text style ={styles.headertext}>
            Select a pet
          </Text>
        </View>
        <View style={styles.footerButtonContainer}>
        <Text>Dog</Text>
        <TouchableOpacity
              
              onPress={()=>{this.props.navigation.navigate("Namer",
              {Place:this.place,
              Animal:"Dog",
              Picture: "dog.jpg",
              }
              )}}>
              <Image style={styles.petImageStyle1} source={require('./images/pixeldog3.png')}/>  
            </TouchableOpacity> 
            <Text>Cat</Text>
            <TouchableOpacity
              
              onPress={()=>{this.props.navigation.navigate("Namer",
              {Place:this.place,
              Animal:"Cat",
              Picture: "cat.jpg",
              }
              )}}>
              <Image style={styles.petImageStyle1} source={require('./images/pixelcat3.png')}/>  
            </TouchableOpacity>
            <Text>Bird</Text>
            <TouchableOpacity
              
              onPress={()=>{this.props.navigation.navigate("Namer",
              {Place:this.place,
              Animal:"Bird",
              Picture: "bird.jpg",
              }
              )}}>
              <Image style={styles.petImageStyle1} source={require('./images/pixelbird3.png')}/>  
            </TouchableOpacity>                       
          </View>
        </View>
     );
}
}

class PetNamer extends React.Component {

  constructor(props) {
      super(props);
      appPets = [];
      this.state = {
        inputText: '',
 
      }
    }

    async updateDataframe() {
      await getPets()
      this.setState({theList:appPets});
      theList = this.state.theList

      }

    async componentDidMount() {
      this.focusUnsubscribe = this.props.navigation.addListener('focus', this.onFocus);
      }
    
    //recieves place, animal, and picture from PetMaker
    onFocus = () => {
      this.place = this.props.route.params.Place;
      this.animal = this.props.route.params.Animal;
      this.picture = this.props.route.params.Picture;
    }

//render function renders a textbox. Button press creates a pet item in firebase with using inputtext from the text box as well as picture, place, and animal
//from the PetMaker class.
render() {
  return (
  <View>
      <View style ={styles.header}>
        <Text style ={styles.headertext}>
          What is your pet's name?
        </Text>
      </View>
      <View style={styles.textInputContainer}>
          <TextInput
            placeholder='Enter item text'
            style={styles.textInputBox}
            onChangeText={(text) => this.setState({inputText: text})}
            value={this.state.inputText}
          />
   
      </View>
      <View style={styles.footerButtonContainer}>
      <TouchableOpacity
        style={styles.footerButton}
        disabled = {!(this.state.inputText)}
        style={[(this.state.inputText) ? styles.footerButton:styles.footerButton2]}
        onPress={()=>{let index = this.place + Math.random()
        this.props.navigation.navigate("Home",
        addNewToFireBase(this.animal, this.picture, this.state.inputText, this.place, index)
        )}}>
        <Text>Create Pet!</Text>
      </TouchableOpacity>
      </View>
      </View>
   );
}
}

class ProfileScreen extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>
          This is a profile page!
        </Text>
      </View>
    );
  }
}

class PetInteraction extends React.Component {

  constructor(props) {
    super(props);
    appPets = [];
    this.state = {
      theList: [], // MAGGIE EDITED
      currentpet: '',
      feedbutton: true,
      playbutton: true,
      timeOfPlayPress: 'reee',
      y: '',
      // dummy: 0,
    }
  }

  async componentDidMount() {
    this.focusUnsubscribe = this.props.navigation.addListener('focus', this.onFocus);
    this.updateDataframe();
    // this.apiCalls();
    }

    componentWillUnmount() {
    this.focusUnsubscribe();
  }

  // apiCalls() {
  //   this.setState({
  //     currentpet: this.state.currentpet,
  //   });
  // }

   async updateDataframe() {
    await getPets();
    this.setState({theList:appPets});
    this.setState({list_wascreated:true});
    this.state.currentpet = this.state.theList[(this.props.route.params.Place)];
    await this.updateTimer(this.state.currentpet.key, this.state.currentpet, this.state.currentpet.dateAdded, this.state.currentpet.Stamina, this.state.currentpet.Happiness); //ALISON - updateTimer() gets called when the pet page laods after the user clicks the Interact button
    await getPets();  //need to call getPets again to get changes made in updateTimer
    this.setState({theList:appPets}); 
    this.setState({list_wascreated:true});
    this.state.currentpet = this.state.theList[(this.props.route.params.Place)];
   }

   updateTimer = async(id, pet, dateAdded, stamina, happiness) => { //ALISON - updateTimer reduces stamina and happiness over time
    

    let latestDate = new Date();
      

    let dateDifference = (latestDate - dateAdded.toDate());
        // console.log("Date difference is:  ", dateDifference);  //time returned is in milliseconds
      

    //milliseconds per hour 3,600,000
    //milliseconds per day 86,400,000
    //milliseconds per minute 60,000

    let multiplier = 0
    let pointsToRemove = 10;

    if(dateDifference > 3000 && stamina !=0 && happiness !=0 )  //for testing: swap 86400000 for 60000 to test in minutes

    multiplier = Math.floor(dateDifference/3000); //for testing: swap 86400000 for 60000 to test in minutes
         //console.log("multiplyer is : ", multiplier);
      
    multipliedPointsToRemove = pointsToRemove * multiplier  //mulitply number of days by number of points to remove per dat
    
      stamina -= multipliedPointsToRemove;
      happiness -= multipliedPointsToRemove;

   pet.dateAdded = latestDate;  //ALISON - update dateAdded every time the user interacts with their pet - updateTimer() gets called when the pet page laods after the user clicks the Interact button
   pet.stamina = stamina;
   pet.happiness = happiness;

   

   UpdateToFireBase(pet.species, pet.pic, pet.name, pet.key, pet.stamina, pet.happiness, pet.canFeed, pet.canPlay, pet.dateAdded, pet.index)

  }

  onFocus = () => {
    this.updateDataframe()
  }

  // refreshFeed = async(pet, feedbutton) => { // MAGGIE 16
  //   if (pet.canFeed == true) {
  //     return;
  //   }
  //   else {
  //     setTimeout(() => feedbutton = activateFeed(pet, feedbutton), 10000);
  //     this.setState({
  //       feedbutton: feedbutton,
  //     });
  //   }
  // }

  // refreshPlay = async(pet, playbutton) => { // MAGGIE 16
  //   if (pet.canFeed == true) {
  //     return;
  //   }
  //   else {
  //     setTimeout(() => playbutton = activatePlay(pet, playbutton), 10000);
  //     this.setState({
  //       playbutton: playbutton,
  //     });
  //   }
  // }

  feedPet = async(pet) => { // STEPHEN: Recomend reducing this for testing purposes. Didn't get to this yet.
    if (pet.canFeed == true && pet.Stamina <= 100) {
      pet.Stamina += 20;
      pet.canFeed = false;
      this.setState({feedbutton:false});
      await refreshFeed(pet, this.state.feedbutton); // MAGGIE 16
      if (pet.Stamina > 100) {
        pet.Stamina = 100
      } // MAGGIE E
      await UpdateToFireBase(pet.species, pet.pic, pet.name, pet.key, pet.Stamina,pet.Happiness, pet.canFeed, pet.canPlay, pet.dateAdded, pet.index); //STEPHEN: This seems to be a simpler way to update the pet in firebase. Adding the a doc with the same id replaces the old doc.
      this.updateDataframe(); // MAGGIE E
      this.setState({
        currentpet: pet,
        // feedbutton: this.state.feedbutton,  // MAGGIE 16
      });
      return pet; 
    }
    else {
      return;
    }
  }

  NegfeedPet = async(id, pet) => { // STEPHEN: Recomend reducing this for testing purposes. Didn't get to this yet.
    
      pet.Stamina += (0 - 15);
      await UpdateToFireBase(pet.species, pet.pic, pet.name, pet.key, pet.Stamina,pet.Happiness, pet.canFeed, pet.canPlay); //STEPHEN: This seems to be a simpler way to update the pet in firebase. Adding the a doc with the same id replaces the old doc.
      this.updateDataframe();
      return pet; 

  }

  playPet = async(pet) => {

    if (pet.canPlay == true && pet.Happiness <= 100) {
      pet.Happiness += 20;
      pet.canPlay = false;
      this.setState({playbutton:false});
      await refreshPlay(pet, this.state.playbutton); // MAGGIE 16
      if (pet.Happiness > 100) {
        pet.Happiness = 100
      }
      await UpdateToFireBase(pet.species, pet.pic, pet.name, pet.key, pet.Stamina,pet.Happiness, pet.canFeed, pet.canPlay, pet.dateAdded, pet.index); //STEPHEN: See above
      this.updateDataframe(); // MAGGIE E: added awaits
      this.setState({
        currentpet: pet,
        // playbutton: this.state.playbutton, // MAGGIE 16
      });
      return pet;
    }
    else {
      return;
    }
  }

  // refreshFeedButton = async(feedbutton) => {
  //   this.setState
  // }

  NegplayPet = async(id, pet) => {
  
   
      pet.Happiness += (0 - 15);
      await UpdateToFireBase(pet.species, pet.pic, pet.name, pet.key, pet.Stamina,pet.Happiness, pet.canFeed, pet.canPlay); //STEPHEN: See above
      this.updateDataframe();
      return pet;
    
  }

  async onDeletePet(key) { //STEPHEN
    let inventoryRef = db.collection('pets');
    let itemDoc = inventoryRef.doc(String(key));
    await itemDoc.delete();
    this.updateDataframe();
  }



  render() {
    let petintpic;
    if (this.state.currentpet.Stamina > 0 && this.state.currentpet.Happiness > 0){
    if (this.state.currentpet.species === 'Dog' && this.state.currentpet.Stamina >= 50 && this.state.currentpet.Happiness >= 50){ //STEPHEN
      petintpic = 
      <Image style={styles.petImageStyle2} source={require('./images/pixeldog3.png')}/>  
      }

    if (this.state.currentpet.species === 'Dog' && this.state.currentpet.Stamina < 50 && this.state.currentpet.Happiness < 50){
      petintpic = 
      <Image style={styles.petImageStyle2} source={require('./images/pixeldog3_sick_sad.png')}/>  
      }
    
    if (this.state.currentpet.species === 'Dog' && this.state.currentpet.Stamina < 50 && this.state.currentpet.Happiness >= 50){
      petintpic = 
      <Image style={styles.petImageStyle2} source={require('./images/pixeldog3_sick.png')}/>  
      }
  
    if (this.state.currentpet.species === 'Dog' && this.state.currentpet.Stamina >= 50 && this.state.currentpet.Happiness < 50){
      petintpic = 
      <Image style={styles.petImageStyle2} source={require('./images/pixeldog3_sad.png')}/>  
      }
    
    if (this.state.currentpet.species === 'Cat' && this.state.currentpet.Stamina >= 50 && this.state.currentpet.Happiness >= 50){
      petintpic = 
      <Image style={styles.petImageStyle2} source={require('./images/pixelcat3.png')}/>  
      }

    if (this.state.currentpet.species === 'Cat' && this.state.currentpet.Stamina < 50 && this.state.currentpet.Happiness < 50){
      petintpic = 
      <Image style={styles.petImageStyle2} source={require('./images/pixelcat3_sad_sick.png')}/>  
      }
    
    if (this.state.currentpet.species === 'Cat' && this.state.currentpet.Stamina < 50 && this.state.currentpet.Happiness >= 50){
      petintpic = 
      <Image style={styles.petImageStyle2} source={require('./images/pixelcat3_sick.png')}/>  
      }
  
    if (this.state.currentpet.species === 'Cat' && this.state.currentpet.Stamina >= 50 && this.state.currentpet.Happiness < 50){
      petintpic = 
      <Image style={styles.petImageStyle2} source={require('./images/pixelcat3_sad.png')}/>  
      }
    
    if (this.state.currentpet.species === 'Bird' && this.state.currentpet.Stamina >= 50 && this.state.currentpet.Happiness >= 50){
      petintpic = 
      <Image style={styles.petImageStyle2} source={require('./images/pixelbird3.png')}/>  
      }
  
    if (this.state.currentpet.species === 'Bird' && this.state.currentpet.Stamina < 50 && this.state.currentpet.Happiness < 50){
      petintpic = 
      <Image style={styles.petImageStyle2} source={require('./images/pixelbird3_sick_sad.png')}/>  
      }
      
    if (this.state.currentpet.species === 'Bird' && this.state.currentpet.Stamina < 50 && this.state.currentpet.Happiness >= 50){
      petintpic = 
      <Image style={styles.petImageStyle2} source={require('./images/pixelbird3_sick.png')}/>  
      }
    
    if (this.state.currentpet.species === 'Bird' && this.state.currentpet.Stamina >= 50 && this.state.currentpet.Happiness < 50){
      petintpic = 
      <Image style={styles.petImageStyle2} source={require('./images/pixelbird3_sad.png')}/>  
      }}
    else {
      petintpic= <View style={styles.looseconditioncontainer}>
      <Text style={styles.looseconditionlabel}>
        OH NO!
      </Text>
      <View>
        <Text style = {styles.looseconditiontext}>
          Your pet ran away. You monster.
        </Text>
        </View>
    </View>
    }

    return (
      <View style={styles.footerButtonContainer}>
        <Text style ={styles.headertext}>
            {this.state.currentpet.name}
        </Text>
        <View>
          {petintpic}
        </View>
        <Text style = {styles.bodytext}>
          Stamina: {this.state.currentpet.Stamina}
        </Text>
        <Text style = {styles.bodytext}>
          Happiness: {this.state.currentpet.Happiness}
        </Text>
    
      <TouchableOpacity
        // disabled = {!this.state.feedbutton}
        style={[(this.state.currentpet.canFeed) ? styles.petintbutton:styles.petintbutton2]}
        onPress={()=>{  // MAGGIE
          this.feedPet(this.state.currentpet) // MAGGIE E
          
        }}>
        <Text>Feed</Text>
      </TouchableOpacity>
      <TouchableOpacity

        // disabled = {!this.state.playbutton} // MAGGIE 16
        style={[(this.state.currentpet.canPlay) ? styles.petintbutton:styles.petintbutton2]}
        onPress={()=>{
          this.playPet(this.state.currentpet); // MAGGIE E
  
        }}>

        <Text>Play</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.petintbutton}
       
        onPress={()=>{  // MAGGIE
   
          this.NegfeedPet(this.state.currentpet.key, this.state.currentpet)
        }}>
        <Text>NegFeed</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.petintbutton}
        onPress={()=>{
          this.NegplayPet(this.state.currentpet.key, this.state.currentpet)
        }}>

        <Text>NegPlay</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.petintbutton}       
        onPress={()=>{this.onDeletePet(this.state.currentpet.index); //STEPHEN
                      this.props.navigation.navigate("Home")}}>
        <Text>Release</Text>
      </TouchableOpacity>

      </View>
      
    );
  }
}
// App constructor and nav bar
const Tab = createMaterialBottomTabNavigator();

function Home() {
  return ( // MAGGIE 16
    <Stack.Navigator
      initialRouteName="Home"
    >
      <Stack.Screen name="Login" component={LoginScreen} /> 
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Maker" component={PetMaker} />
      <Stack.Screen name="Namer" component={PetNamer} />
      <Stack.Screen name="Interact" component={PetInteraction} />
    </Stack.Navigator>
  );
}

function MyTabs() {
  return (
    <Tab.Navigator 
      initialRouteName='Login' // MAGGIE 16
      activeColor='#e91e63'
      labelStyle={{ fontSize: 12 }}
      style={{ backgroundColor: 'tomato' }}
    >
      <Tab.Screen
        name='Login'
        component={Home}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name='home' color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name='Profile'
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name='account' color={color} size={26} />
          ),
        }}
      />      
    </Tab.Navigator>
  );
}

function App() {
  return (
    <NavigationContainer>
      <MyTabs />
    </NavigationContainer>
  );
}
  
export default App;