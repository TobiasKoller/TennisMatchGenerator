using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Input;
using TennisMatchGenerator.Models;
using TennisMatchGenerator.Repositories;
using TennisMatchGenerator.Services;

namespace TennisMatchGenerator.ViewModel
{
    public class MainViewModel
    {
        public ObservableCollection<Player> AvailablePlayers { get; set; }
        private SettingService _settingsService;
        public ICommand AddPlayerCommand { get; private set; }

        public MainViewModel() 
        {

            _settingsService = new SettingService(new SettingRepository());
            AddPlayerCommand = new Command(AddPlayer);
            Init();
        }

        private void Init()
        {
            AvailablePlayers = new ObservableCollection<Player>();

            //var matchDay = new MatchDay(); //TODO from service
            //matchDay.AvailablePlayers.Add(new Player { FirstName = "Tobias", LastName = "Koller",TotalPoints=23,LK=20.4 });
            //matchDay.AvailablePlayers.Add(new Player { FirstName = "Matthias", LastName = "Koller", TotalPoints = 13, LK = 20.9 });

            //foreach(var player in matchDay.AvailablePlayers) AvailablePlayers.Add(player);
        }

        private void AddPlayer()
        {
            //var p = new Player { FirstName = "Player", LastName = AvailablePlayers.Count + "x", TotalPoints = 13, LK = 20.9 };
            //AvailablePlayers.Add(p);
        }

        public void GenerateMatches()
        {
            //TODO
        }
    }
}
