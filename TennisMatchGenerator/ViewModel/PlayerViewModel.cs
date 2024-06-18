using CommunityToolkit.Mvvm.ComponentModel;
using Syncfusion.Maui.DataGrid;
using System.Collections.ObjectModel;
using System.Windows.Input;
using TennisMatchGenerator.Models;
using TennisMatchGenerator.Repositories;
using TennisMatchGenerator.Services;

namespace TennisMatchGenerator.ViewModel
{
    public partial class PlayerViewModel : ObservableObject
    {
        public ICommand AddPlayerCommand { get; private set; }
        public ICommand SaveCommand { get; private set; }
        public ICommand SelectionChangedCommand { get;private set; }
        public ICommand PlayerPropertyChangedCommand { get; private set; }

        [ObservableProperty]
        public bool _showAddPlayerDialog;
        //[ObservableProperty]
        //public Player? _currentPlayer;

        //[ObservableProperty]
        //public ObservableCollection<Player> _players;

        //[ObservableProperty]
        //public Player? _selectedPlayer;

        public ObservableCollection<Player> Players { get; private set; }   
        public Player SelectedPlayer { get; private set; }

        private PlayerService _service;
        public PlayerViewModel()
        {
            _service = new PlayerService(new PlayerRepository());
            AddPlayerCommand = new Command(AddPlayer);
            SaveCommand = new Command(Save);
            SelectionChangedCommand = new Command(SelectionChanged);

            Init();
            ////_currentPlayer = new Player();
            //_players = new ObservableCollection<Player>();

            //ReloadPlayers();
        }

        private void SelectionChanged(object args)
        {
            //if (args is DataGridSelectionChangedEventArgs parameters)
            //{
            //    var player = parameters?.AddedRows?.FirstOrDefault();
            //    if (player is Player selectedPlayer)
            //    {
            //        SelectedPlayer = selectedPlayer;
            //    }
            //}
            
            

        }

        private void SetSelectedPlayer(Player? player=null)
        {
            SelectedPlayer = player??new Player();
        }

        private void Init()
        {
            Players = new ObservableCollection<Player>();
            ReloadPlayers();
        }

        private void ReloadPlayers()
        {
            Reset();
            var players = _service.GetAll();
            Players.Clear();
            foreach (Player player in players)
            {
                Players.Add(player);
            }
        }

        private void AddPlayer()
        {
            ShowAddPlayerDialog = true;
        }

        private void Reset()
        {
            SetSelectedPlayer(null);
        }

       
        private void Save()
        {
            //TODO richtige Formvalidierung. Dies ist nur zum schnellen Testen.
            //if (string.IsNullOrWhiteSpace(CurrentPlayer.FirstName)) return;
            //if (string.IsNullOrWhiteSpace(CurrentPlayer.LastName)) return;

            if (SelectedPlayer.Id == Guid.Empty) _service.AddPlayer(SelectedPlayer);
            else _service.UpdatePlayer(SelectedPlayer);

            ReloadPlayers();
        }
    }
}
