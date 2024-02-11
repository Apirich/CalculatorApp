import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import React, { useState } from 'react';

export default function App() {
  const [answerValue, setAnswerValue] = useState(0);
  const [readyToReplace, setReadyToReplace] = useState(true);
  const [memoryValue, setMemoryValue] = useState();
  const [operatorValue, setOperatorValue] = useState();

  const [clearButton, setClearButton] = useState("AC");
  const [operationEquation, setOperationEquation] = useState("");
  const [resultReady, setResultReady] = useState(false);
  const [prevKey, setPrevKey] = useState();
  const [floatStarted, setFloatStarted] = useState(false);

  function buttonPressed(val){
    if(!isNaN(val) || val === "."){// Int and float numbers (digits and point buttons)
      if(resultReady){//Calculate (result +-*/ number) is okay, not (number +-*/ result) -> reset
        setMemoryValue(0);
        setOperatorValue();
        setOperationEquation("");
        setAnswerValue(val);
        setReadyToReplace(false);
        setFloatStarted(false);
        setResultReady(false);
      }else{
        if(val === "."){// Handle if "." was pressed many time
          if(!floatStarted){
            setFloatStarted(true);
            setClearButton("C");
            setAnswerValue(handleNumber(val));
          }
        }else{
          setClearButton("C");
          setAnswerValue(handleNumber(val));
        }
      }
    }else{// Other buttons
      if(val === clearButton){// "AC/C" button
        if(val === "AC"){// "AC" button
          setMemoryValue(0);
          setOperatorValue();
          setOperationEquation("");
        }else{// "C" button
          if(resultReady){// "C" button is pressed after result of a calculation (bug if combine as || in if "AC")
            setMemoryValue(0);
            setOperatorValue();
            setOperationEquation("");
          }
          setClearButton("AC");
        }
        setAnswerValue(0);
        setReadyToReplace(true);
        setFloatStarted(false);
      }else if(val === "="){// "=" button
        let result = calculateEquals(operatorValue);

        // Store latest result to allow continuos calculation
        setMemoryValue(result);

        // Ready to replace answerValue
        setReadyToReplace(true);

        if(!resultReady){// Initial "=" with and without any operator
          setResultReady(true);

          if(prevKey === "."){// Cast x.0 to x for display in operationEquation
            setOperationEquation(operationEquation + parseInt(answerValue) + val);
          }else{
            setOperationEquation(operationEquation + answerValue + val);
          }
        }else{// Following "=" without any operator
          if(operatorValue == null){
            if(prevKey === "."){// Cast x.0 to x for display in operationEquation
              setAnswerValue(parseInt(answerValue));
              setOperationEquation(parseInt(answerValue) + val); //Avoid thread issues
            }else{
              setOperationEquation(answerValue + val);
            }
          }else{// Following "=" with the same operator on the initial answerValue
            setOperationEquation(answerValue + operatorValue + answerValue + val);
          }
        }
      }else if(val === "+/-"){// "+/-" button
        if(resultReady){// Operation after result
          setMemoryValue(answerValue * (-1));
        }

        setAnswerValue(answerValue * (-1));
      }else if(val === "%"){// "%" button
        if(resultReady){// Operation after result
          setMemoryValue(answerValue * 0.01);
        }

        setAnswerValue(answerValue * 0.01);
      }else{// Operator "+ - x /" button
        setReadyToReplace(true);
        setFloatStarted(false);

        // DISPLAY operationEquation
        // Cast x.0 to x for display in operationEquation
        // Use parseInt(answerValue) instead directly change on answerValue to avoid threads issues
        if(resultReady){// Initial/latest result
          setOperationEquation(answerValue + val);
          setResultReady(false);
        }else{// Continuos calculation after initial/latest result
          if(prevKey === "."){// Cast x.0 to x for display in operationEquation
            setOperationEquation(operationEquation + parseInt(answerValue) + val);
          }else{
            setOperationEquation(operationEquation + answerValue + val);
          }
        }

        if(operatorValue == null){// Initial calculation
          setMemoryValue(answerValue);
        }
        else{// Chain calculation
          if(!isNaN(prevKey) || prevKey === "." || prevKey == val){// Check if operator was mistyped and replaced
            let midVal = calculateEquals(operatorValue);
            setMemoryValue(midVal);
          }
        }
        setOperatorValue(val);
      }
    }

    setPrevKey(val);
  }

  function handleNumber(val){
    if(readyToReplace == true){
      setReadyToReplace(false);
      return val;
    }else{
      return answerValue + val;
    }
  }

  function calculateEquals(opVal){
    let previous = parseFloat(memoryValue);
    let current = parseFloat(answerValue);

    switch(opVal){
      case "+":
        setAnswerValue(previous + current);
        return previous + current;
      case "-":
        setAnswerValue(previous - current);
        return previous - current;
      case "x":
        setAnswerValue(previous * current);
        return previous * current;
      case "/":
        setAnswerValue(previous / current);
        return previous / current;
    }
  }

  return (
    <View style = {styles.container}>
      <SafeAreaView>
        <ScrollView horizontal = {true}>
          <View>
            <Text style = {styles.scientificDisplay}>{operationEquation}</Text>
          </View>
        </ScrollView>

        <View>
          <Text style = {styles.calVal}>{answerValue}</Text>
        </View>

        {/* ---------  1st Row --------- */}
        <View style = {styles.row}>
          {/* C Button */}
          <TouchableOpacity style = {styles.firstRowPad} onPress={() => buttonPressed(clearButton)}>
            <Text style = {styles.keyPad}>{clearButton}</Text>
          </TouchableOpacity>

          {/* +/- Button */}
          <TouchableOpacity style = {styles.firstRowPad} onPress={() => buttonPressed("+/-")}>
            <Text style = {styles.keyPad}>+/-</Text>
          </TouchableOpacity>

          {/* % Button */}
          <TouchableOpacity style = {styles.firstRowPad} onPress={() => buttonPressed("%")}>
            <Text style = {styles.keyPad}>%</Text>
          </TouchableOpacity>

          {/* / Button */}
          <TouchableOpacity style = {[styles.firstRowPad, {backgroundColor: "blue"}]} onPress={() => buttonPressed("/")}>
            <Text style = {styles.keyPad}>/</Text>
          </TouchableOpacity>
        </View>

        {/* --------- 2nd Row --------- */}
        <View style = {styles.row}>
          {/* 7 Button */}
          <TouchableOpacity style = {styles.pad} onPress={() => buttonPressed("7")}>
            <Text style = {styles.keyPad}>7</Text>
          </TouchableOpacity>

          {/* 8 Button */}
          <TouchableOpacity style = {styles.pad} onPress={() => buttonPressed("8")}>
            <Text style = {styles.keyPad}>8</Text>
          </TouchableOpacity>

          {/* 9 Button */}
          <TouchableOpacity style = {styles.pad} onPress={() => buttonPressed("9")}>
            <Text style = {styles.keyPad}>9</Text>
          </TouchableOpacity>

          {/* x Button */}
          <TouchableOpacity style = {[styles.pad, {backgroundColor: "blue"}]} onPress={() => buttonPressed("x")}>
            <Text style = {styles.keyPad}>x</Text>
          </TouchableOpacity>
        </View>

        {/* --------- 3rd Row --------- */}
        <View style = {styles.row}>
          {/* 4 Button */}
          <TouchableOpacity style = {styles.pad} onPress={() => buttonPressed("4")}>
            <Text style = {styles.keyPad}>4</Text>
          </TouchableOpacity>

          {/* 5 Button */}
          <TouchableOpacity style = {styles.pad} onPress={() => buttonPressed("5")}>
            <Text style = {styles.keyPad}>5</Text>
          </TouchableOpacity>

          {/* 6 Button */}
          <TouchableOpacity style = {styles.pad} onPress={() => buttonPressed("6")}>
            <Text style = {styles.keyPad}>6</Text>
          </TouchableOpacity>

          {/* - Button */}
          <TouchableOpacity style = {[styles.pad, {backgroundColor: "blue"}]} onPress={() => buttonPressed("-")}>
            <Text style = {styles.keyPad}>-</Text>
          </TouchableOpacity>
        </View>

        {/* --------- 4th Row --------- */}
        <View style = {styles.row}>
          {/* 1 Button */}
          <TouchableOpacity style = {styles.pad} onPress={() => buttonPressed("1")}>
            <Text style = {styles.keyPad}>1</Text>
          </TouchableOpacity>

          {/* 2 Button */}
          <TouchableOpacity style = {styles.pad} onPress={() => buttonPressed("2")}>
            <Text style = {styles.keyPad}>2</Text>
          </TouchableOpacity>

          {/* 3 Button */}
          <TouchableOpacity style = {styles.pad} onPress={() => buttonPressed("3")}>
            <Text style = {styles.keyPad}>3</Text>
          </TouchableOpacity>

          {/* + Button */}
          <TouchableOpacity style = {[styles.pad, {backgroundColor: "blue"}]} onPress={() => buttonPressed("+")}>
            <Text style = {styles.keyPad}>+</Text>
          </TouchableOpacity>
        </View>

        {/* --------- 5th Row --------- */}
        <View style = {styles.row}>
          {/* 0 Button */}
          <TouchableOpacity style = {[styles.pad, {width: buttonWidth * 11/5}]} onPress={() => buttonPressed("0")}>
            <Text style = {[styles.keyPad, {marginRight: buttonWidth}]}>0</Text>
          </TouchableOpacity>

          {/* . Button */}
          <TouchableOpacity style = {styles.pad} onPress={() => buttonPressed(".")}>
            <Text style = {[styles.keyPad, {marginBottom: buttonWidth/4}]} >.</Text>
          </TouchableOpacity>

          {/* = Button */}
          <TouchableOpacity style = {[styles.pad, {backgroundColor: "blue"}]} onPress={() => buttonPressed("=")}>
            <Text style = {styles.keyPad}>=</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <StatusBar style="light" />
    </View>
  );
}

const buttonWidth = Dimensions.get("window").width/5;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "flex-end",
  },

  scientificDisplay: {
    color: "white",
    fontSize: 30,
    marginTop: buttonWidth * 3/2,
  },

  calVal: {
    color: "white",
    fontSize: 70,
    textAlign: "right",
    marginRight: buttonWidth/5,
  },

  row: {
    flexDirection: "row",
  },

  firstRowPad: {
    backgroundColor: "lightgray",
    width: buttonWidth,
    height: buttonWidth,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: buttonWidth/2,
    marginLeft: buttonWidth/10,
    marginRight: buttonWidth/10,
    marginTop: buttonWidth/10,
  },

  pad: {
    backgroundColor: "gray",
    width: buttonWidth,
    height: buttonWidth,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: buttonWidth/2,
    marginLeft: buttonWidth/10,
    marginRight: buttonWidth/10,
    marginTop: buttonWidth/10,
  },

  keyPad: {
    color: "white",
    fontSize: 35,
  },
});
