using Syncfusion.Maui.Data;
using Syncfusion.Maui.DataForm;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace TennisMatchGenerator.Behaviors
{
    public class DataFormRefreshBehavior : Behavior<SfDataForm>
    {
        public DataFormRefreshBehavior() 
        { 
        
        }
        private SfDataForm? _dataForm;

        protected override void OnAttachedTo(SfDataForm bindable)
        {
            base.OnAttachedTo(bindable);
            this._dataForm = bindable;
            this._dataForm.PropertyChanged += DataForm_PropertyChanged;
        }

        private void DataForm_PropertyChanged(object? sender, System.ComponentModel.PropertyChangedEventArgs e)
        {
            if (e.PropertyName == "DataObject")
            {
                _dataForm?.DataObject.GetType()
                    .GetRuntimeProperties()
                    .ForEach(p => _dataForm.UpdateEditor(p.Name));

                //if (_dataForm?.DataObject != null)
                //{
                //    foreach (var property in _dataForm.DataObject.GetType().GetRuntimeProperties())
                //    {
                //        _dataForm.UpdateEditor(property.Name);
                //    }
                //}
            }
        }

        protected override void OnDetachingFrom(SfDataForm bindable)
        {
            base.OnDetachingFrom(bindable);
            if (this._dataForm != null)
            {
                this._dataForm.PropertyChanged -= DataForm_PropertyChanged;
                this._dataForm = null;
            }
        }
    }
}
