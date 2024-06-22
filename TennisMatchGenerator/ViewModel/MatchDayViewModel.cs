using CommunityToolkit.Mvvm.ComponentModel;
using Syncfusion.Maui.DataGrid;
using System.Collections.ObjectModel;
using System.Windows.Input;
using TennisMatchGenerator.Models;
using TennisMatchGenerator.Repositories;
using TennisMatchGenerator.Services;

namespace TennisMatchGenerator.ViewModel
{
    

    public partial class MatchDayViewModel: ObservableObject
    {
        public ObservableCollection<Player> AvailablePlayers { get; private set; }
        public ObservableCollection<Player> Players { get; private set; }
        public List<Player> SelectedPlayers { get; private set; }
        public ICommand RemovePlayerCommand { get; private set; }
        public ICommand AddPlayerCommand { get; private set; }
        public ICommand AddSelectedPlayersCommand { get; private set; }
        public ICommand SelectionChangedCommand { get; private set; }


        [ObservableProperty]
        public bool _showAddPlayerDialog;

        private MatchDayService _service;
        private PlayerService _playerService;
        public MatchDayViewModel()
        {
            Players = new ObservableCollection<Player>();
            AvailablePlayers = new ObservableCollection<Player>();
            SelectedPlayers = new List<Player>();

            RemovePlayerCommand = new Command(RemovePlayer);
            AddPlayerCommand = new Command(AddPlayer);
            AddSelectedPlayersCommand = new Command(AddSelectedPlayers);
            SelectionChangedCommand = new Command(SelectionChanged);
            _service = new MatchDayService(new MatchDayRepository());
            _playerService = new PlayerService(new PlayerRepository());

            ReloadAvailablePlayers();
        }

        private void OpenAddPlayerDialog()
        {
            ShowAddPlayerDialog = true;
        }

        private void SelectionChanged(object args)
        {
            if (args is DataGridSelectionChangedEventArgs parameters)
            {
                SelectedPlayers.Clear();
                var player = parameters?.AddedRows;
                if (player is Player selectedPlayer)
                {
                    SelectedPlayers.Add(selectedPlayer);
                }
            }
        }

        private void RemovePlayer(object args)
        {
            if (args is Player player)
            {
                //TODO ask before
                //_service.RemovePlayer(player.Id);
                //ReloadPlayers();
            }
        }

        private void AddPlayer()
        {
            OpenAddPlayerDialog();
        }

        private void AddSelectedPlayers()
        {

        }

        private void ReloadPlayers()
        {
            //Reset();
            //var players = _service.GetAll();
            //Players.Clear();
            //foreach (Player player in players)
            //{
            //    Players.Add(player);
            //}
        }

        private void ReloadAvailablePlayers()
        {
            var availablePlayers = _playerService.GetAll().Where(ap => Players.All(p=>p.Id != ap.Id));
            foreach (Player player in availablePlayers)
            {
                AvailablePlayers.Add(player);
            }
        }
    }
}
