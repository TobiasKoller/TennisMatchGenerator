using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TennisMatchGenerator.Models.Constants;

namespace TennisMatchGenerator.Repositories
{

    public class PlayerRepository : RepositoryBase
    {
        public PlayerRepository() : base(DatabaseCollections.Player) { }
    }
}
