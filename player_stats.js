const {
  getPlayerStats,
  getTeamStats,
  reduceStats,
  getMatchGameId,
} = require("./common");

module.exports = (game) => {
  const winningColor =
    game.blue.stats.core.goals > game.orange.stats.core.goals
      ? "blue"
      : "orange";
  const colors = ["blue", "orange"];
  return colors.reduce((result, color) => {
    result = result.concat(
      game[color] &&
        game[color].players &&
        game[color].players.map((player) => {
          const ownStats = getPlayerStats(player);
          const modifiers = [
            { inName: "inflicted", outName: "demos_inflicted" },
            { inName: "taken", outName: "demos_taken" },
          ];
          const opponentColor = colors.filter((c) => c !== color)[0];
          const opponentStats = getTeamStats(game, opponentColor);
          const stats = reduceStats({
            ownStats,
            game,
            modifiers,
            opponentStats,
          });
          return {
            ballchasing_id: game.id,
            rl_game_id: game.rocket_league_id,
            player_name: player.name,
            player_platform: player.id.platform,
            player_platform_id: player.id.id,
            color: player.color,
            wins: color === winningColor ? 1 : 0,
            goals: player.stats.core.goals,
            shots: player.stats.core.shots,
            assists: player.stats.core.assists,
            saves: player.stats.core.saves,
            score: player.stats.core.score,
            color,
            ...stats,
          };
        })
    );
    return result;
  }, []);
};
