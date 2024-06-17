using CommunityToolkit.Mvvm.ComponentModel;
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

        [ObservableProperty]
        public Player? _currentPlayer;

        [ObservableProperty]
        public ObservableCollection<Player> _players;

        [ObservableProperty]
        public Player? _selectedPlayer;

        private PlayerService _service;
        public PlayerViewModel()
        {
            _service = new PlayerService(new PlayerRepository());
            AddPlayerCommand = new Command(AddPlayer);
            SaveCommand = new Command(Save);
            SelectionChangedCommand = new Command(SelectionChanged);

            //_currentPlayer = new Player();
            _players = new ObservableCollection<Player>();

            ReloadPlayers();
        }

        private void ReloadPlayers()
        {
            var players = _service.GetAll();
            Players.Clear();
            foreach (Player player in players)
            {
                Players.Add(player);
            }
        }

        private void AddPlayer()
        {
            Reset();
        }

        private void Reset()
        {
            CurrentPlayer = new Player();
        }

        private void SelectionChanged()
        {

        }
       
        private void Save()
        {
            //TODO richtige Formvalidierung. Dies ist nur zum schnellen Testen.
            if (string.IsNullOrWhiteSpace(CurrentPlayer.FirstName)) return;
            if (string.IsNullOrWhiteSpace(CurrentPlayer.LastName)) return;

            if (CurrentPlayer.Id == Guid.Empty)
                _service.AddPlayer(CurrentPlayer);
            else
                _service.UpdatePlayer(CurrentPlayer);

            Reset();
            ReloadPlayers();
        }
    }
}
