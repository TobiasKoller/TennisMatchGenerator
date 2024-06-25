using CommunityToolkit.Mvvm.ComponentModel;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using TennisMatchGenerator.Models;
using TennisMatchGenerator.Repositories;
using TennisMatchGenerator.Services;

namespace TennisMatchGenerator.ViewModel
{
   
    public partial class SettingViewModel : ObservableObject
    {

        public Setting Setting { get; set; }
        public SettingService _service;

        public ICommand SaveCommand { get; private set; }

        //[ObservableProperty]
        //public int _numberOfCourts;

        //private Guid _settingId;
        public SettingViewModel()
        {
            _service = new SettingService(new SettingRepository());
            SaveCommand = new Command(Save);
            Init();
        }

        private void Init()
        {
            var settings = _service.Get();

            Setting = settings;
            //_settingId = settings.Id;
            //NumberOfCourts = settings.NumberOfCourts;
            
        }

        private void Save()
        {
            _service.Update(Setting);
        }

    }
}
