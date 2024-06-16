using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Threading.Tasks;
using TennisMatchGenerator.Models;
using TennisMatchGenerator.Repositories;

namespace TennisMatchGenerator.Services
{

    public class PlayerService : ServiceBase<PlayerRepository>
    {
        public PlayerService(PlayerRepository repository) : base(repository) 
        {
        }

        public List<Player> GetAllActivePlayers(bool onlyActive)
        {
            throw new NotImplementedException();
        }
    }

}
