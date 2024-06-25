using CommunityToolkit.Mvvm.ComponentModel;
using System.Collections.ObjectModel;
using System.Windows.Input;
using TennisMatchGenerator.Models;

namespace TennisMatchGenerator.ViewModel
{
    public partial class RankingViewModel : ObservableObject
    {

        public ObservableCollection<Player> AvailablePlayers { get; private set; }
        public ICommand AddPlayerCommand { get; private set; }
        public ICommand AddSelectedPlayersCommand { get; private set; }

        [ObservableProperty]
        public bool _showAddPlayerDialog;

        public RankingViewModel()
        {
            AvailablePlayers = [];
            AddPlayerCommand = new Command(AddPlayer);
            AddSelectedPlayersCommand = new Command(AddSelectedPlayers);
        }

        async private void AddPlayer()
        {
            ShowAddPlayerDialog = true;

            var players = new List<Player> {
                new() { FirstName = "Hans", LastName = "Laier" },
                new() { FirstName = "Peter", LastName = "Fox" },
                new() { FirstName = "Claudia", LastName = "Singer" },
            };

            foreach (var player in players)
            {
                AvailablePlayers.Add(player);
                await Task.Delay(1000);
            }

            var count = AvailablePlayers.Count();
            for(var i = count - 1; i >= 0; i--)
            {
                AvailablePlayers.RemoveAt(i);
                await Task.Delay(1000);
            }
        }

        private void AddSelectedPlayers()
        {

        }
    }
}
