if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);
  Session.setDefault('currentScreen', 'intro');
  //login/sign up
  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
  });

  Template.body.helpers({ //available as tasks
    tasks: function(){
      if (Session.get("hideCompleted")){
        return Tasks.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
      } else {
            return Tasks.find({}, { sort: {createdAt: -1}});
      }
    },
    hideCompleted: function(){
      return Session.get("hideCompleted");
    },
    incompleteCount: function(){
      return Tasks.find({checked: {$ne: true}}).count();
    },
    logout: function(){
      Session.set('current_state', -1);
    },
    signedIn: function(){
      return meteor.userId() != null;
    },
    userId: function(){
      return meteor.userId();
    }
  });

  Session.setDefault('current_state', -1);

  Template.body.events({
    "submit .new-task": function(event){
      event.preventDefault();
      var text = event.target.text.value;
      Meteor.call("addTask", text);
      event.target.text.value = "";
    },
    "change .hide-completed input": function(event){
      Session.set("hideCompleted", event.target.checked); 
    },
    "submit .user-form": function(event){
      event.preventDefault();
      var email = event.target.email.value;
      var password = event.target.password.value;
      Meteor.call("addUser", email, password);
      event.target.email.value = "";
      event.target.password.value = "";
    },
    "click .go-login": function(event){
      Session.set('currentScreen', 'login');
    },
    "click .go-register": function(event){
      Session.set('currentScreen', 'register');
    }

  });

  Template.task.events({
    "click .toggle-checked": function(){
      Meteor.call("setChecked", this._id, ! this.checked);
    },
    "click .delete": function(){
      Tasks.remove(this._id);
    }
  });

  Template.main.helpers({
    templateName: function(){
      return Session.get('currentScreen');
    }
  });
}

Tasks = new Mongo.Collection("tasks");


if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}

Meteor.methods({
  addTask: function(text){
    if (!meteor.userId()){
      throw new Meteor.Error("not-authorized");
    }
    Tasks.insert({
      text: text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },
  deleteTask: function(taskId){
    Tasks.remove(taskId);
  },
  setChecked: function(taskId, setChecked){
    Tasks.update(taskId, {$set: { checked: setChecked} });
  },
  addUser: function(userName, password){
    Accounts.createUser(username=userName, password=passowrd);
  }
});
