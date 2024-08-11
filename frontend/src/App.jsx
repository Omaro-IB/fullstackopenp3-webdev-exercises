import {useEffect, useState} from 'react'
import phoneService from "./services/phoneService.js";

// Filter component
const Filter = ({newFilter, setNewFilter}) => (
    <div> filter shown with
        <input value={newFilter} onChange={(e) => {setNewFilter(e.target.value)}}></input>
    </div>
)

//  Add new person form
const PersonForm = ({newName, setNewName, newNumber, setNewNumber, handleClick}) => (
    <form>
        <div> name: <input value={newName} onChange={(e) => {setNewName(e.target.value)}}></input></div>
        <div> number: <input value={newNumber} onChange={(e) => {setNewNumber(e.target.value)}}></input></div>
        <div> <button type="submit" onClick={handleClick}>add</button> </div>
    </form>
)

// A single person
const Person = ({name, number, onDelete}) => (
    <div className={"person"} style = {{display: 'flex', flexDirection: 'row'}}>
        <div>{name} {number}</div>
        <div style={{width:"30px"}}> </div>
        <button onClick={onDelete}>delete</button>
    </div>
)


const App = () => {
    // States
    const [persons, setPersons] = useState([])
    const [newName, setNewName] = useState('')
    const [newNumber, setNewNumber] = useState('')
    const [newFilter, setNewFilter] = useState('')
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('notification')

    // Message
    const Message = () => {
        if (message.length > 0) {return <div className={messageType}>{message}</div>}
        else {return <div></div>}
    }
    const displayMessage = (msg, type) => {
        setMessageType(type)
        setMessage(msg)
        setTimeout(() => {setMessage("")}, 3000)
    }


    // Refresh data
    const refreshData = () => {
        phoneService.getAll().then(data => {
            setPersons(data)
        }).catch(_ => {
            displayMessage("Error getting data from server", "error")
        })
    }
    useEffect(refreshData, []);  // refresh on first render


    // List of persons
    const Persons = () => {
        const personsToShow = (newFilter === '') ? persons : persons.filter(p => (p.name.toUpperCase().includes(newFilter.toUpperCase())))
        return (<div>{personsToShow.map(p => <Person key={p.id} name={p.name} number={p.number} onDelete={() => {
            if (window.confirm("Do you really want to delete?")) {
                phoneService.deletePerson(p.id).then(data => {
                    displayMessage(`Deleted ${data.name}`, "notification")
                    setPersons(persons.filter(p => p.id !== data.id))
                }).catch(_ => {
                    displayMessage(`${p.name} already deleted from server`, "error")
                    refreshData()})
            }
        }}
        ></Person>)}</div>)
    }


    // Handles 'add' button click
    const handleAdd = (e) => {
        e.preventDefault()  // prevent page reload
        let personExists = -1  // -1 if doesn't exist, else ID of the duplicate person
        let largestID = -1

        persons.forEach(p => {
            if (p.name === newName) {personExists = p.id}
            if (parseInt(p.id) > largestID) {largestID = parseInt(p.id)}
        });  // check for already-existing person & for largest ID

        if (personExists === -1) {  // add person if does not already exist
            const newPerson = {name: newName, number: newNumber, id: (largestID+1).toString()}
            phoneService.createPerson(newPerson).then(data => {
                setPersons(persons.concat(data))
                displayMessage(`Added ${newName}`, "notification")
            }).catch(_ => {
                displayMessage("Error creating person", "error")
            })
        } else {  // if exists, update upon user confirmation
            if (window.confirm(`"${newName}" is already added to the phonebook, replace the old number with the new one?`)) {
                const newPerson = {name: newName, number: newNumber, id: personExists}
                phoneService.updatePerson(personExists, newPerson).then(data => {
                    setPersons(persons.map(p => {if (p.id === data.id) {return data} else {return p}}))
                    displayMessage(`Updated ${newName}`, "notification")
                }).catch(_ => {
                    setPersons(persons.filter(p => p.id !== personExists))
                    displayMessage(`${newName} already deleted from server`, "error")
                })
            }
        }

        setNewName(''); setNewNumber('')  // reset fields
    }


    return (
        <div>
            <Message />
            <h1>Phonebook</h1>
            <Filter newFilter={newFilter} setNewFilter={setNewFilter} />
            <h2>Add New Entry</h2>
            <PersonForm newName={newName} setNewName={setNewName} newNumber={newNumber} setNewNumber={setNewNumber} handleClick={handleAdd} />
            <h2>Numbers</h2>
            <Persons />
        </div>
    )
}

export default App