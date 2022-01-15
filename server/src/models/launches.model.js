const axios = require('axios')

const launches = require('./launches.mongo')
const planets = require('./planets.mongo')

// const launches = new Map()

// let latestFlightNumber = 100
const DEFAULT_FLIGHT_NUMBER = 100

const launch = {
  flightNumber: 100,
  mission: 'Kepler Exploration X',
  rocket: 'Explorer IS1',
  target: 'Kepler-442 b',
  launchDate: new Date('January 1, 2025'),
  customers: ['ZTM', 'NASA'],
  upcoming: true,
  success: true
}

// launches.set(launch.flightNumber, launch)

async function getAllLaunches(skip, limit) {
  // return Array.from(launches.values())
  return await launches.find({}, '-_id -__v').skip(skip).limit(limit).sort({flightNumber: 1})
}

async function scheduleNewLaunch(launch) {
  const target = await planets.findOne({keplerName: launch.target})
  if (!target) throw new Error('No matching planet found')

  const latestFlightNumber = await getLatestFlightNumber() + 1
  const newLaunch = Object.assign(launch, {
      flightNumber: latestFlightNumber,
      customers: ['ZTM', 'NASA'],
      upcoming: true,
      success: true,
    })

    await saveLaunch(newLaunch)
}

// function addNewLaunch(launch) {
//   latestFlightNumber++
//   launches.set(latestFlightNumber,
//     Object.assign(launch, {
//       flightNumber: latestFlightNumber,
//       customers: ['ZTM', 'NASA'],
//       upcoming: true,
//       success: true,
//     }))
// }

async function saveLaunch(launch) {

  await launches.findOneAndUpdate({
    flightNumber: launch.flightNumber
  }, launch, {upsert: true})
}

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query'

async function populateLaunches() {
  console.log('Downloading launches data...')
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: 'rocket',
          select: {
            name: 1
          }
        },
        {
          path: 'payloads',
          select: {
            customers: 1
          }
        }
      ]}
    })

  if (response.status !== 200) {
    console.log('Problem downloading launch data...')
    throw new Error('Launch data not fetched')
  }

  const launchDocs = response.data.docs
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc['payloads']
    const customers = payloads.flatMap((payload) => payload['customers'])
    const launch = {
      flightNumber: launchDoc['flight_number'],
      mission: launchDoc['name'],
      rocket: launchDoc['rocket']['name'],
      launchDate: launchDoc['date_local'],
      upcoming: launchDoc['upcoming'],
      success: launchDoc['success'],
      customers,
    }
    console.log(`${launch.flightNumber} ${launch.mission}`)
    await saveLaunch(launch)
  }
}

async function loadsLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1
  })
  if (firstLaunch) console.log('Launch data already loaded!')
  else await populateLaunches()

  }

async function findLaunch(filter) {
  return await launches.findOne(filter)
}

async function existsLaunchWithId(launchId) {
  // return launches.has(launchId)
  return await findLaunch({flightNumber: launchId})
}

async function getLatestFlightNumber() {
  const latestLaunch = await launches.findOne().sort('-flightNumber')
  if (!latestLaunch) return DEFAULT_FLIGHT_NUMBER
  return latestLaunch.flightNumber
}

async function abortLaunchById(launchId) {
  // const aborted = launches.get(launchId)
  // aborted.success = false
  // aborted.upcoming = false
  // return aborted
  const aborted = await launches.updateOne({
    flightNumber: launchId
  }, {
    success: false,
    upcoming: false,
  })
  return aborted.modifiedCount === 1
}

module.exports = {
  loadsLaunchData,
  getAllLaunches,
  scheduleNewLaunch,
  existsLaunchWithId,
  abortLaunchById,
}
