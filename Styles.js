
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

  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20
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
    padding: 20,
    marginHorizontal: '5%',
    backgroundColor: '#FF8E3C',
    
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
      backgroundColor: "#F88E3C",
      
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
      backgroundColor: '#FF8E3C',
      
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
    padding: 20,
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
  
    middleView: {
      flex: 0.4,
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
    },

    inputRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingVertical: 15
    },

    inputLabel: {
      flex: 0.3,
      justifyContent: 'flex-end',
      paddingRight: 5,
      textAlign: 'right',
    },

    inputText: {
      flex: 0.5,
      borderColor: colors.outline,
      paddingLeft: 5,
      borderBottomWidth: 1,
      fontSize: 18,
    },

    bottomView: {
      flex: 0.3,
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'center',
      alignItems: 'flex-start'
    },

    buttonText: {
      textAlign: 'center',
      // color: 'white'
    },

    buttonContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.outline,
      borderRadius: 6,
      backgroundColor: "#FF8E3C",
      width: 100,
      height: 50
    },

});