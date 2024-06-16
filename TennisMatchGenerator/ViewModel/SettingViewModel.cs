using CommunityToolkit.Mvvm.ComponentModel;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using TennisMatchGenerator.Models;
using TennisMatchGenerator.Repositories;
using TennisMatchGenerator.Services;

namespace TennisMatchGenerator.ViewModel
{
   
    public partial class SettingViewModel : ObservableObject
    {
        public SettingService _settingService;

  

        [ObservableProperty]
        public int _numberOfCourts;

        public SettingViewModel()
        {
            _settingService = new SettingService(new SettingRepository());
            Init();
        }

        private void Init()
        {
            var settings = _settingService.Get();
            _numberOfCourts = settings.NumberOfCourts;

            _numberOfCourts = 55;
            
        }

    }
}
