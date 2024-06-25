using LiteDB;
using System.Reflection;

namespace TennisMatchGenerator.Repositories
{


    public abstract class RepositoryBase : IRepository
    {
        protected string CollectionName;
        
        public RepositoryBase(string collectionName) 
        {
            CollectionName = collectionName;
        }

        private ILiteCollection<T> GetCollection<T>() => GetDb().GetCollection<T>(CollectionName);

        private LiteDatabase GetDb()
        {
            return Database.Instance;
        }

        public Guid Create<T>(T entry)
        {
            return GetCollection<T>().Insert(entry);
        }

        public bool Delete<T>(Guid id)
        {
            return GetCollection<T>().Delete(id);
        }

        public T Get<T>(Guid id)
        {
            return GetCollection<T>().FindById(id);
        }

        public List<T> GetAll<T>()
        {
            return GetCollection<T>().FindAll().ToList();
        }

        public bool Update<T>(T entry)
        {
            
           return GetCollection<T>().Update(entry);

        }

    }
}
