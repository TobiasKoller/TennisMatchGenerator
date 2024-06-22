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
        public ICommand EditCommand { get; private set; }   
        public ICommand DeleteCommand { get; private set; }

        [ObservableProperty]
        public bool _showPlayerDetailDialog;

        public ObservableCollection<Player> Players { get; private set; }

        [ObservableProperty]
        public Player _selectedPlayer;

        [ObservableProperty]
        public bool _createMode;

        private PlayerService _service;
        public PlayerViewModel()
        {
            _service = new PlayerService(new PlayerRepository());
            AddPlayerCommand = new Command(AddPlayer);
            SaveCommand = new Command(Save);
            SelectionChangedCommand = new Command(SelectionChanged);
            EditCommand = new Command(EditPlayer);
            DeleteCommand = new Command(DeletePlayer);

            Players = new ObservableCollection<Player>();
            ReloadPlayers();
            ////_currentPlayer = new Player();
            //_players = new ObservableCollection<Player>();

            //ReloadPlayers();
        }

        private void SelectionChanged(object args)
        {
            if (args is DataGridSelectionChangedEventArgs parameters)
            {
                var player = parameters?.AddedRows?.FirstOrDefault();
                if (player is Player selectedPlayer)
                {
                    SetSelectedPlayer(selectedPlayer);
                }
            }
        }

        private bool IsExistingPlayer()
        {
            return SelectedPlayer != null && SelectedPlayer.Id != Guid.Empty;
        }

        private void EditPlayer(object args)
        {
            if (args is Player player)
            {
                SetSelectedPlayer(player);
                OpenPlayerDetailsDialog();
            }
        }


        private void DeletePlayer(object args)
        {
            if(args is Player player)
            {
                //TODO ask before
                _service.DeletePlayer(player.Id);
                ReloadPlayers();
            }
        }
        private void SetSelectedPlayer(Player? player=null)
        {
            SelectedPlayer = player??new Player();
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
            CreateMode = true;
            SetSelectedPlayer(null);

            OpenPlayerDetailsDialog();
        }

        private void OpenPlayerDetailsDialog()
        {
            ShowPlayerDetailDialog = true;
        }

        private void Reset()
        {
            SetSelectedPlayer(null);
            CreateMode = false;
        }

       
        private async void Save()
        {


            //TODO richtige Formvalidierung. Dies ist nur zum schnellen Testen.
            //if (string.IsNullOrWhiteSpace(CurrentPlayer.FirstName)) return;
            //if (string.IsNullOrWhiteSpace(CurrentPlayer.LastName)) return;

            if (SelectedPlayer.Id == Guid.Empty) _service.AddPlayer(SelectedPlayer);
            else _service.UpdatePlayer(SelectedPlayer);

            ReloadPlayers();
            Reset();
        }
    }
}
