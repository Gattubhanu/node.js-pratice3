const express = require('express')
const app = express()
app.use(express.json())
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const dbpath = path.join(__dirname, 'cricketTeam.db')
module.exports = app
let db = null
const initlizedbandserver = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error : ${e.message}`)
    procress.exit(1)
  }
}
initlizedbandserver()
const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
 SELECT
 *
 FROM
 cricket_team;`
  const playersArray = await db.all(getPlayersQuery)
  response.send(
    playersArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

app.post('/players/', async (request, response) => {
  const bookdetails = request.body
  const {playerName, jerseyNumber, role} = bookdetails
  const addquery = `insert into cricket_team (player_name,jersey_number,role)
  values('${playerName}',${jerseyNumber},'${role}')`
  const query = await db.run(addquery)
  const playerId = query.lastID
  response.send('Player Added to Team')
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const query = `select * from cricket_team where player_id=${playerId}`
  const updated = await db.get(query)
  response.send(convertDbObjectToResponseObject(updated))
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const bookdetails = request.body
  const {playerName, jerseyNumber, role} = bookdetails
  const updatedquery = `update cricket_team 
   set 
   player_name='${playerName}',
   jersey_number=${jerseyNumber},
   role='${role}' where player_id=${playerId}`
  await db.run(updatedquery)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const query = `delete from cricket_team where player_id=${playerId}`
  await db.run(query)
  response.send('Player Removed')
})
