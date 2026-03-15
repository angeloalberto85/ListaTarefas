import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform, 
  Keyboard 
} from 'react-native';

export default function App() {
  const [task, setTask] = useState('');
  const [taskList, setTaskList] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. CARREGAR DADOS AO INICIAR
  useEffect(() => {
    async function loadTasks() {
      try {
        const jsonValue = await AsyncStorage.getItem('@todo_tasks');
        if (jsonValue !== null) {
          setTaskList(JSON.parse(jsonValue));
        }
        setIsLoaded(true);
      } catch (e) {
        console.error("Erro ao carregar dados", e);
      }
    }
    loadTasks();
  }, []);

  // 2. SALVAR DADOS SEMPRE QUE A LISTA MUDAR
  useEffect(() => {
    async function saveTasks() {
      try {
        if (isLoaded) {
          const jsonValue = JSON.stringify(taskList);
          await AsyncStorage.setItem('@todo_tasks', jsonValue);
        }
      } catch (e) {
        console.error("Erro ao salvar dados", e);
      }
    }
    saveTasks();
  }, [taskList, isLoaded]);

  // 3. FUNÇÕES DE LÓGICA
  const handleAddTask = () => {
    if (task.trim().length > 0) {
      const newTask = { 
        id: Date.now().toString(), 
        text: task, 
        completed: false 
      };
      setTaskList([...taskList, newTask]);
      setTask('');
      Keyboard.dismiss();
    }
  };

  const toggleTask = (id) => {
    const updatedTasks = taskList.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setTaskList(updatedTasks);
  };

  const deleteTask = (id) => {
    setTaskList(taskList.filter(item => item.id !== id));
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minhas Tarefas</Text>
        <Text style={styles.headerSubtitle}>
          {taskList.filter(t => !t.completed).length} pendentes
        </Text>
      </View>

      {/* LISTA DE TAREFAS */}
      <View style={styles.tasksWrapper}>
        <FlatList
          data={taskList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <TouchableOpacity 
                style={styles.itemTextContainer} 
                onPress={() => toggleTask(item.id)}
              >
                <Text style={[
                  styles.itemText, 
                  item.completed && styles.itemTextCompleted
                ]}>
                  {item.text}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => deleteTask(item.id)}>
                <View style={styles.deleteButton}>
                  <Text style={styles.deleteText}>X</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      </View>

      {/* INPUT E BOTÃO ADICIONAR */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.writeTaskWrapper}
      >
        <TextInput 
          style={styles.input} 
          placeholder={'Nova tarefa...'} 
          value={task} 
          onChangeText={text => setTask(text)} 
        />
        <TouchableOpacity onPress={handleAddTask}>
          <View style={styles.addWrapper}>
            <Text style={styles.addText}>+</Text>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#4A90E2',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#D1E4F9',
    marginTop: 5,
  },
  tasksWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  item: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    elevation: 2,
  },
  itemTextContainer: {
    flex: 0.8,
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
  itemTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#AAA',
  },
  deleteButton: {
    backgroundColor: '#FFE5E5',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    color: '#FF4D4D',
    fontWeight: 'bold',
  },
  writeTaskWrapper: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
    borderRadius: 30,
    borderColor: '#C0C0C0',
    borderWidth: 1,
    width: '75%',
    elevation: 3,
  },
  addWrapper: {
    width: 55,
    height: 55,
    backgroundColor: '#4A90E2',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  addText: {
    fontSize: 30,
    color: '#FFF',
  },
});