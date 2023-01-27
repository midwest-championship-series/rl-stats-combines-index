const combineStats = (stats) => ({
  ...stats.core,
  ...stats.boost,
  ...stats.movement,
  ...stats.positioning,
  ...stats.demo,
})

const getTeam = (game) => {
  return (color) => game[color]
}

const getTeamStats = (game, color) => {
  return combineStats(getTeam(game)(color).stats)
}

const getPlayerStats = (player) => combineStats(player.stats)

const timeModifier = (value) => value * 1000

const reduceStats = ({ ownStats, game, modifiers, opponentStats }) => {
  return Object.keys(ownStats).reduce((memo, prop) => {
    let { inName, outName, out } = modifiers.find((m) => m.inName === prop) || { inName: prop, outName: prop }
    if (inName.split('_')[0] === 'time') {
      out = timeModifier
      outName = ['ms', ...inName.split('_').slice(1)].join('_')
    }
    if (!out) out = (value) => value
    memo[outName] = out(ownStats[inName], game)
    if (opponentStats) memo[`opponent_${outName}`] = out(opponentStats[inName], game)
    return memo
  }, {})
}

const getPlayerTeamsAtDate = (player, matchDate) => {
  return player.team_history.filter(
    (item) => item.date_joined < matchDate && (!item.date_left || item.date_left > matchDate),
  )
}

const getMatchGameId = (matchId, gameNumber) => {
  return `match:${matchId}:game:${gameNumber}`
}

module.exports = { getTeamStats, getPlayerStats, getPlayerTeamsAtDate, reduceStats, getMatchGameId }
