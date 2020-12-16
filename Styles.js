
import { StyleSheet } from 'react-native';
import { normalize, withTheme } from 'react-native-elements';

export const colors = {
  primary: '#324098', // MD Amber 500
  primaryDark: '#6b77af', // MD Brown 300
  primaryLight: '#BDBDBD', // MD Amber 200
  outline: '#BDBDBD' // MD Gray 400
}

export const styles = StyleSheet.create({
  
  footerButtonContainer: {
    flexDirection: 'column',

    height: '80%',
    alignItems: "center",
    marginTop: 25,
  },

  looseconditioncontainer: {
  alignItems: "center",
  paddingTop: 25,
  paddingBottom: 25,
  },

  looseconditionlabel: {
  fontSize: 40,
  },

  looseconditiontext: {
    fontSize: 24,
  },

  header: {
    alignItems: "center",
    marginTop: 50,
  },

  headertext: {
    fontSize: 50,
  },

  bodytext: {
    fontSize: 20,
  },

  body: {
    flex: 0.4,
    alignItems: 'stretch',
    justifyContent: 'center',
    width: '100%',
    padding: '5%',
  },

  footerButton: {
    borderRadius: 12,
    borderColor: colors.outline,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginHorizontal: '5%',
    backgroundColor: colors.primaryDark,
    
    },

    petintbutton: {
      borderRadius: 12,
      borderColor: colors.outline,
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
      width: 150,
      height: 50,
      marginHorizontal: '5%',
      backgroundColor: colors.primaryDark,
      
      },

    petintbutton2: {
      borderRadius: 12,
      borderColor: colors.outline,
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
      width: 150,
      height: 50,
      marginHorizontal: '5%',
      backgroundColor: 'lightgray',
        
      },

    interactbutton: {
      borderRadius: 12,
      borderColor: colors.outline,
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 5,
      marginHorizontal: '5%',
      backgroundColor: colors.primaryDark,
      
      },
  
  textStyle: {
    color: 'black',
    fontSize: 100
  },

  footerButton2: {
    borderRadius: 12,
    borderColor: colors.outline,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginHorizontal: '5%',
    backgroundColor: 'lightgray',
    
    },

    textInputContainer: {
      marginTop: '30%',
      flex: 0.3,
      justifyContent: 'center',
      alignItems: 'center',
    },

    textInputBox: {
      borderColor: colors.outline,
      borderWidth: 1,
      width: '80%', 
      height: 40, 
      fontSize: 24,
      padding: 5,
    },

    petImageStyle1: {
      
      height: 150,
      width: 150,
      padding: 0,
      margin: 0,
      resizeMode: 'contain',
      
    },

    petImageStyle2: {
      
      height: 250,
      width: 250,
      padding: 0,
      margin: 0,
      resizeMode: 'contain',
      
    },

});