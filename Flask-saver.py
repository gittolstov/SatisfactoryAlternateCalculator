from flask import Flask, render_template, request, redirect, flash, url_for, session


app = Flask(__name__)


@app.route('/write', methods=["POST"])
def pst():
    write_to_db(request.data.decode('ascii'))
    return "success"


@app.route('/read')
def read():
    return read_from_db()


@app.route("/")
def pend():
    return render_template("index.html")


filepath = "recipes.txt"


def write_to_db(data):
    with open(filepath, "w", encoding="utf-8") as file:
        file.write(data)


def read_from_db():
    with open(filepath, "r", encoding="utf-8") as file:
        return file.read()


if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=False)