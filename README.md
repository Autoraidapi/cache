This is a deprecated api. Undesirable side effects may occur.


### Control Flow Test

A console log proxy has been added to log messages to the Document.

- Store

instance method `testPending`

- Model

instance method `testPending` call to Store.testPending.then

- Template

instance method `testPending`

- View

instance method `testPending` call to Template.testPending.then

- Controller

instance method `test` resolves `Model.testPending` and `View.testPending` using Memoization 


- Main

instance method `test` linked to controller
